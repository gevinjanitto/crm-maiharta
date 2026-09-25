import asyncio
from pathlib import Path
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from core import db, uid, now, authorize, project_scope, project_for, project_public, log_event, validate_assignee, MANAGERS, FINANCE, STATUSES
from auth import current_user
from schemas import Record, ProjectInput, StatusInput, FeatureInput, ProgressInput, CostInput, WorkInput, WorkUpdate, DeployInput
from storage import put_object, get_object

router = APIRouter()
DOC_TYPES = ['Kontrak','Requirement','Rincian Fitur','Timeline','UI/UX Design','Penawaran Harga','Invoice','Akses Server','BAST','Dokumentasi Penggunaan']

@router.get('/projects', response_model=list[Record])
async def projects(u=Depends(current_user)):
    await authorize(u,'project.read')
    rows = await db.projects.find(project_scope(u),{'_id':0}).sort('created_at',-1).to_list(2000)
    return [project_public(p,u) for p in rows]

@router.post('/projects', response_model=Record)
async def create_project(data: ProjectInput,u=Depends(current_user)):
    await authorize(u,'project.write')
    c=await db.clients.find_one({'id':data.client_id},{'_id':0})
    if not c: raise HTTPException(400,'Client tidak ditemukan.')
    for dev in data.assigned_to: await validate_assignee(dev)
    number=await db.counters.find_one_and_update({'id':'project'},{'$inc':{'value':1}},upsert=True,return_document=True,projection={'_id':0})
    p={**data.model_dump(mode='json'),'id':uid(),'code':f"MH-{number['value']:03d}",'client_name':c['name'],'status':STATUSES[0],'progress':0,'development_cost':0,'server_cost':0,'created_at':now(),'updated_at':now(),'created_by':u['id'],'production_at':None,'tickets_closed':False}
    await db.projects.insert_one(p.copy())
    await log_event(p['id'],u,'Project dibuat',to_status=STATUSES[0])
    return project_public(p,u)

@router.get('/projects/{pid}',response_model=Record)
async def get_project(pid:str,u=Depends(current_user)):
    return project_public(await project_for(u,pid),u)

@router.patch('/projects/{pid}',response_model=Record)
async def edit_project(pid:str,data:ProjectInput,u=Depends(current_user)):
    await project_for(u,pid,'project.write')
    c=await db.clients.find_one({'id':data.client_id},{'_id':0})
    if not c: raise HTTPException(400,'Client tidak ditemukan.')
    for dev in data.assigned_to: await validate_assignee(dev)
    await db.projects.update_one({'id':pid},{'$set':{**data.model_dump(mode='json'),'client_name':c['name'],'updated_at':now()}})
    await log_event(pid,u,'Informasi project diperbarui')
    return project_public(await project_for(u,pid),u)

@router.delete('/projects/{pid}')
async def delete_project(pid:str,u=Depends(current_user)):
    p=await project_for(u,pid,'project.write')
    if p['status']!='Project Masuk': raise HTTPException(400,'Hanya project baru yang dapat dihapus.')
    await db.projects.delete_one({'id':pid})
    for collection in ['project_features','project_documents','project_status_logs','revisions','maintenances','deployments','tickets']:
        await db[collection].delete_many({'project_id':pid})
    return {'message':'Project dihapus.'}

@router.post('/projects/{pid}/status',response_model=Record)
async def change_status(pid:str,data:StatusInput,u=Depends(current_user)):
    p=await project_for(u,pid,'project.status')
    if data.status not in STATUSES: raise HTTPException(400,'Status tidak valid.')
    idx=STATUSES.index(p['status'])
    allowed=STATUSES[idx+1:idx+2]
    if p['status']=='Testing': allowed+=['Uploaded to Production']
    if p['status']=='Revisi': allowed+=['Testing']
    if data.status not in allowed: raise HTTPException(400,'Status harus mengikuti urutan workflow project.')
    if data.status in ['Uploaded to Production','Selesai'] and u['role']!='Admin': raise HTTPException(403,'Hanya Admin yang dapat menetapkan status final.')
    if u['role']=='Developer' and not (p['status'],data.status) in [('Development','Uploaded to Dev Server'),('Uploaded to Dev Server','Testing'),('Testing','Revisi'),('Revisi','Testing')]: raise HTTPException(403,'Developer hanya dapat memperbarui status teknis.')
    if data.status=='Development':
        docs=await db.project_documents.distinct('kind',{'project_id':pid,'is_deleted':False})
        missing=[d for d in DOC_TYPES[:4] if d not in docs]
        if missing: raise HTTPException(400,'Lengkapi dokumen wajib: '+', '.join(missing))
    if data.status=='Uploaded to Production':
        active=await db.revisions.count_documents({'project_id':pid,'status':{'$ne':'Selesai'}})
        if active: raise HTTPException(400,'Selesaikan semua revisi sebelum production.')
    update={'status':data.status,'updated_at':now()}
    if data.status=='Uploaded to Production': update['production_at']=now()
    if data.status=='Selesai': update['progress']=100
    await db.projects.update_one({'id':pid},{'$set':update})
    await log_event(pid,u,f"{p['status']} → {data.status}",from_status=p['status'],to_status=data.status,note=data.note)
    return project_public({**p,**update},u)

@router.get('/projects/{pid}/history',response_model=list[Record])
async def history(pid:str,u=Depends(current_user)):
    await project_for(u,pid,'history.read')
    rows=await db.project_status_logs.find({'project_id':pid},{'_id':0}).sort('created_at',-1).to_list(500)
    if u['role']=='Client':
        return [{k:r[k] for k in ['id','message','created_at','to_status'] if k in r} for r in rows if r.get('to_status')]
    return rows

@router.get('/projects/{pid}/features',response_model=list[Record])
async def features(pid:str,u=Depends(current_user)):
    await project_for(u,pid,'feature.read')
    projection={'_id':0}
    if u['role'] not in MANAGERS+['Accounting']: projection['price']=0
    return await db.project_features.find({'project_id':pid},projection).to_list(1000)

@router.post('/projects/{pid}/features',response_model=Record)
async def create_feature(pid:str,data:FeatureInput,u=Depends(current_user)):
    p=await project_for(u,pid,'feature.write')
    await validate_assignee(data.assigned_to,p)
    f={**data.model_dump(mode='json'),'id':uid(),'project_id':pid,'status':'Belum dimulai','created_at':now()}
    await db.project_features.insert_one(f.copy())
    await recalc_progress(pid)
    return f

async def recalc_progress(pid):
    all_count=await db.project_features.count_documents({'project_id':pid})
    done=await db.project_features.count_documents({'project_id':pid,'status':'Selesai'})
    await db.projects.update_one({'id':pid},{'$set':{'progress':round(done/all_count*100) if all_count else 0}})

@router.patch('/projects/{pid}/features/{fid}',response_model=Record)
async def update_feature(pid:str,fid:str,data:ProgressInput,u=Depends(current_user)):
    await project_for(u,pid,'feature.progress')
    f=await db.project_features.find_one({'id':fid,'project_id':pid},{'_id':0})
    if not f: raise HTTPException(404,'Fitur tidak ditemukan.')
    if u['role']=='Developer' and f.get('assigned_to') not in ['',u['id']]: raise HTTPException(403,'Fitur ditugaskan kepada developer lain.')
    await db.project_features.update_one({'id':fid,'project_id':pid},{'$set':{'status':data.status}})
    await recalc_progress(pid)
    f['status']=data.status
    if u['role']=='Developer': f.pop('price',None)
    return f

@router.delete('/projects/{pid}/features/{fid}')
async def delete_feature(pid:str,fid:str,u=Depends(current_user)):
    await project_for(u,pid,'feature.write')
    r=await db.project_features.delete_one({'id':fid,'project_id':pid})
    if not r.deleted_count: raise HTTPException(404,'Fitur tidak ditemukan.')
    await recalc_progress(pid)
    return {'message':'Fitur dihapus.'}

@router.get('/projects/{pid}/costs')
async def costs(pid:str,u=Depends(current_user)):
    p=await project_for(u,pid,'cost.read')
    return {k:p.get(k,0) for k in ['value','development_cost','server_cost']} | {'profit':p['value']-p.get('development_cost',0)-p.get('server_cost',0)}

@router.post('/projects/{pid}/costs')
async def update_costs(pid:str,data:CostInput,u=Depends(current_user)):
    await project_for(u,pid,'cost.write')
    await db.projects.update_one({'id':pid},{'$set':data.model_dump()})
    await log_event(pid,u,'Biaya project diperbarui')
    return await costs(pid,u)

@router.get('/projects/{pid}/documents',response_model=list[Record])
async def documents(pid:str,u=Depends(current_user)):
    await project_for(u,pid,'document.read')
    query={'project_id':pid,'is_deleted':False}
    if u['role']=='Client': query['visibility']='Client'
    if u['role']=='Accounting': query['kind']={'$in':['Kontrak','Penawaran Harga','Invoice','BAST']}
    return await db.project_documents.find(query,{'_id':0,'storage_path':0}).to_list(1000)

@router.post('/projects/{pid}/documents',response_model=Record)
async def upload_document(pid:str,file:UploadFile=File(...),kind:str=Form(...),visibility:str=Form('Internal'),u=Depends(current_user)):
    await project_for(u,pid,'document.write')
    if kind not in DOC_TYPES or visibility not in ['Internal','Client']: raise HTTPException(400,'Kategori atau visibilitas tidak valid.')
    if kind=='Akses Server' and visibility=='Client': raise HTTPException(400,'Dokumen akses server wajib internal.')
    ext=Path(file.filename or '').suffix.lower()
    if ext not in ['.pdf','.docx','.xlsx','.txt','.csv','.png','.jpg','.jpeg','.webp']: raise HTTPException(400,'Format tidak didukung. Gunakan PDF, DOCX, XLSX, TXT, CSV, atau gambar.')
    data=await file.read(10*1024*1024+1)
    if not data or len(data)>10*1024*1024: raise HTTPException(400,'File harus berukuran 1 byte hingga 10 MB.')
    doc_id=uid()
    try: result=await asyncio.to_thread(put_object,f'crm-maiharta/uploads/{u["id"]}/{doc_id}{ext}',data,file.content_type or 'application/octet-stream')
    except Exception: raise HTTPException(502,'Penyimpanan dokumen belum dapat dihubungi. Silakan coba kembali.')
    doc={'id':doc_id,'project_id':pid,'name':Path(file.filename).name,'kind':kind,'visibility':visibility,'size':len(data),'storage_path':result['path'],'content_type':file.content_type or 'application/octet-stream','created_at':now(),'uploaded_by':u['name'],'is_deleted':False}
    await db.project_documents.insert_one(doc.copy())
    doc.pop('storage_path')
    return doc

@router.get('/projects/{pid}/documents/{did}/download')
async def download_document(pid:str,did:str,u=Depends(current_user)):
    await project_for(u,pid,'document.read')
    q={'id':did,'project_id':pid,'is_deleted':False}
    if u['role']=='Client': q['visibility']='Client'
    if u['role']=='Accounting': q['kind']={'$in':['Kontrak','Penawaran Harga','Invoice','BAST']}
    d=await db.project_documents.find_one(q,{'_id':0})
    if not d: raise HTTPException(404,'Dokumen tidak ditemukan.')
    try: content=await asyncio.to_thread(get_object,d['storage_path'])
    except Exception: raise HTTPException(502,'Dokumen belum dapat diunduh.')
    return Response(content,media_type=d['content_type'],headers={'Content-Disposition':f"attachment; filename*=UTF-8''{quote(d['name'])}",'X-Content-Type-Options':'nosniff'})

@router.delete('/projects/{pid}/documents/{did}')
async def delete_document(pid:str,did:str,u=Depends(current_user)):
    await project_for(u,pid,'document.write')
    r=await db.project_documents.update_one({'id':did,'project_id':pid,'is_deleted':False},{'$set':{'is_deleted':True}})
    if not r.matched_count: raise HTTPException(404,'Dokumen tidak ditemukan.')
    return {'message':'Dokumen dihapus.'}

def work_action(kind):
    if kind not in ['revisions','maintenances']: raise HTTPException(404,'Modul tidak ditemukan.')
    return 'revision' if kind=='revisions' else 'maintenance'

@router.get('/work/{kind}',response_model=list[Record])
async def all_work(kind:str,u=Depends(current_user)):
    action=work_action(kind)
    await authorize(u,action+'.read')
    projects=await db.projects.find(project_scope(u),{'_id':0,'id':1,'name':1}).to_list(2000)
    names={p['id']:p['name'] for p in projects}
    rows=await db[kind].find({'project_id':{'$in':list(names)}},{'_id':0}).sort('created_at',-1).to_list(2000)
    if u['role']=='Developer':
        for r in rows: r.pop('estimate',None)
    return [{**r,'project_name':names[r['project_id']]} for r in rows]

@router.get('/projects/{pid}/work/{kind}',response_model=list[Record])
async def project_work(pid:str,kind:str,u=Depends(current_user)):
    await project_for(u,pid,work_action(kind)+'.read')
    projection={'_id':0}
    if u['role']=='Developer': projection['estimate']=0
    return await db[kind].find({'project_id':pid},projection).sort('created_at',-1).to_list(1000)

@router.post('/projects/{pid}/work/{kind}',response_model=Record)
async def create_work(pid:str,kind:str,data:WorkInput,u=Depends(current_user)):
    p=await project_for(u,pid,work_action(kind)+'.write')
    allowed=['In-scope','Out-of-scope','Change Request'] if kind=='revisions' else ['Adaptive','Corrective','Change Request']
    if data.kind not in allowed: raise HTTPException(400,'Jenis pekerjaan tidak valid.')
    if kind=='maintenances' and not p.get('production_at'): raise HTTPException(400,'Maintenance hanya dapat dibuat setelah project production.')
    await validate_assignee(data.assigned_to,p)
    doc={**data.model_dump(mode='json'),'id':uid(),'project_id':pid,'status':'Terbuka','approved':False,'created_at':now(),'completed_at':None,'created_by':u['id']}
    await db[kind].insert_one(doc.copy())
    return doc

@router.patch('/projects/{pid}/work/{kind}/{wid}',response_model=Record)
async def update_work(pid:str,kind:str,wid:str,data:WorkUpdate,u=Depends(current_user)):
    await project_for(u,pid,work_action(kind)+'.write')
    doc=await db[kind].find_one({'id':wid,'project_id':pid},{'_id':0})
    if not doc: raise HTTPException(404,'Pekerjaan tidak ditemukan.')
    if doc['kind'] in ['Out-of-scope','Change Request'] and data.status!='Terbuka' and (doc.get('estimate',0)<=0 or not (data.approved or doc.get('approved'))): raise HTTPException(400,'Pekerjaan di luar scope wajib memiliki estimasi biaya dan persetujuan.')
    update={'status':data.status,'approved':data.approved or doc.get('approved',False),'completed_at':now() if data.status=='Selesai' else None}
    await db[kind].update_one({'id':wid,'project_id':pid},{'$set':update})
    return {**doc,**update}

@router.get('/projects/{pid}/deployments',response_model=list[Record])
async def deployments(pid:str,u=Depends(current_user)):
    await project_for(u,pid,'deployment.read')
    return await db.deployments.find({'project_id':pid},{'_id':0}).sort('created_at',-1).to_list(500)

@router.post('/projects/{pid}/deployments',response_model=Record)
async def create_deploy(pid:str,data:DeployInput,u=Depends(current_user)):
    p=await project_for(u,pid,'deployment.write')
    if data.environment=='Production' and (u['role']!='Admin' or not p.get('production_at')): raise HTTPException(403,'Deployment production dicatat Admin setelah persetujuan production.')
    doc={**data.model_dump(),'id':uid(),'project_id':pid,'created_at':now(),'created_by':u['name']}
    await db.deployments.insert_one(doc.copy())
    return doc