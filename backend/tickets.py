from fastapi import APIRouter,Depends,HTTPException
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
from core import db,uid,now,authorize,project_scope,project_for,validate_assignee,log_activity,TICKET_STATUSES,MANAGERS
from auth import current_user
from schemas import Record,TicketInput,TicketUpdate,CommentInput
from kanban import create_task,sync_task_status
from mailer import notify_assignment
<<<<<<< HEAD
=======
=======
from core import db,uid,now,authorize,project_scope,project_for,validate_assignee,TICKET_STATUSES,MANAGERS
from auth import current_user
from schemas import Record,TicketInput,TicketUpdate,CommentInput
<<<<<<< HEAD
from kanban import create_task,sync_task_status
from mailer import notify_assignment
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
router=APIRouter()
async def visible_tickets(u):
    ids=await db.projects.distinct('id',project_scope(u))
    q={'project_id':{'$in':ids}}
    if u['role']=='Developer': q['assigned_to']=u['id']
    return q
async def ticket_for(u,tid,action):
    t=await db.tickets.find_one({'$and':[await visible_tickets(u),{'id':tid}]},{'_id':0})
    if not t: raise HTTPException(404,'Tiket tidak ditemukan.')
    await authorize(u,action,t)
    return t
def ticket_public(t,u):
    if u['role']=='Developer': t={k:v for k,v in t.items() if k!='estimate'}
    return t
@router.get('/tickets',response_model=list[Record])
async def tickets(u=Depends(current_user)):
    await authorize(u,'ticket.read')
    rows=await db.tickets.find(await visible_tickets(u),{'_id':0}).sort('created_at',-1).to_list(2000)
    return [ticket_public(r,u) for r in rows]
@router.post('/tickets',response_model=Record)
async def create_ticket(data:TicketInput,u=Depends(current_user)):
    await authorize(u,'ticket.create')
    p=await project_for(u,data.project_id)
    if p.get('tickets_closed'): raise HTTPException(400,'Penerimaan tiket untuk project ini sudah ditutup.')
    t={**data.model_dump(),'id':uid(),'code':'TKT-'+uid()[:6].upper(),'project_name':p['name'],'status':'Baru','assigned_to':'','estimate':0,'triaged':False,'approved':False,'created_by':u['id'],'created_by_name':u['name'],'created_at':now(),'updated_at':now()}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    task=await create_task(t['project_id'],u,title=f"[{t['code']}] {t['title']}",description=t['description'],priority=t['priority'],source='ticket',source_id=t['id'],tags=['Tiket',t['category']])
    t['task_id']=task['id']
    await db.tickets.insert_one(t.copy())
    await log_activity(u,'buat','tiket',t['id'],t['title'],t['project_id'])
<<<<<<< HEAD
=======
=======
    await db.tickets.insert_one(t.copy())
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    return t
@router.get('/tickets/{tid}',response_model=Record)
async def get_ticket(tid:str,u=Depends(current_user)): return ticket_public(await ticket_for(u,tid,'ticket.read'),u)

@router.patch('/tickets/{tid}',response_model=Record)
async def update_ticket(tid:str,data:TicketUpdate,u=Depends(current_user)):
    t=await ticket_for(u,tid,'ticket.progress')
    if data.status not in TICKET_STATUSES: raise HTTPException(400,'Status tiket tidak valid.')
    update=data.model_dump(exclude_none=True)
    if u['role']=='Client':
        if set(update)-{'status'} or t['status']!='Menunggu Persetujuan' or data.status not in ['Diterima','Ditolak']: raise HTTPException(403,'Client hanya dapat menyetujui atau menolak estimasi tiket.')
        update['approved']=data.status=='Diterima'
    elif u['role']=='Developer':
        if set(update)-{'status'} or not t.get('triaged') or (t['status'],data.status) not in [('Diterima','Dikerjakan'),('Dikerjakan','Selesai')]: raise HTTPException(403,'Tiket harus ditriase dan diterima sebelum dikerjakan.')
    else:
        await authorize(u,'ticket.triage',t)
        transitions={'Baru':['Ditinjau','Ditolak'],'Ditinjau':['Menunggu Klarifikasi','Diterima','Ditolak','Menunggu Estimasi Biaya'],'Menunggu Klarifikasi':['Ditinjau','Ditolak'],'Menunggu Estimasi Biaya':['Menunggu Persetujuan','Ditolak'],'Menunggu Persetujuan':['Diterima','Ditolak'],'Diterima':['Dikerjakan'],'Dikerjakan':['Selesai'],'Selesai':['Ditutup'],'Ditolak':['Ditutup'],'Ditutup':[]}
        if data.status!=t['status'] and data.status not in transitions[t['status']]: raise HTTPException(400,'Status tiket harus mengikuti alur triase.')
        update['triaged']=True
        if data.assigned_to:
            p=await project_for(u,t['project_id'])
            await validate_assignee(data.assigned_to,p)
        if t['status']=='Menunggu Persetujuan' and data.status=='Diterima': update['approved']=True
    category=update.get('category',t['category'])
    if t.get('approved') and category!=t['category']: update['approved']=False
    if category in ['Change Request','Out of Scope'] and data.status in ['Diterima','Dikerjakan','Selesai','Menunggu Persetujuan']:
        if update.get('estimate',t.get('estimate',0))<=0: raise HTTPException(400,'Change request dan out of scope wajib memiliki estimasi biaya.')
        if data.status in ['Diterima','Dikerjakan','Selesai'] and not update.get('approved',t.get('approved')): raise HTTPException(400,'Estimasi harus disetujui sebelum pekerjaan dimulai.')
    if data.status=='Dikerjakan' and not update.get('assigned_to',t.get('assigned_to')): raise HTTPException(400,'Tentukan developer sebelum pekerjaan dimulai.')
    update['updated_at']=now()
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    assignee=update.get('assigned_to',t.get('assigned_to',''))
    new_assignee=bool(assignee) and assignee!=t.get('assigned_to','')
    if data.status=='Diterima' and not t.get('task_id'):
        task=await create_task(t['project_id'],u,title=f"[{t['code']}] {t['title']}",description=t['description'],assigned_to=assignee,priority=t['priority'],source='ticket',source_id=tid)
        update['task_id']=task['id']
    elif new_assignee:
        await db.tasks.update_many({'source':'ticket','source_id':tid},{'$set':{'assigned_to':assignee,'updated_at':now()}})
        await notify_assignment(assignee,'tiket',t['title'],t['project_id'])
    if data.status in ['Dikerjakan','Selesai'] and data.status!=t['status']: await sync_task_status('ticket',tid,data.status)
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    if data.status=='Ditutup' and data.status!=t['status']: await sync_task_status('ticket',tid,'Selesai')
    if data.status=='Ditolak' and data.status!=t['status']: await db.tasks.delete_many({'source':'ticket','source_id':tid})
    await db.tickets.update_one({'id':tid},{'$set':update})
    await log_activity(u,'ubah status','tiket',tid,t['title'],t['project_id'],{'dari':t['status'],'ke':data.status})
<<<<<<< HEAD
=======
=======
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
    await db.tickets.update_one({'id':tid},{'$set':update})
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    await db.ticket_comments.insert_one({'id':uid(),'ticket_id':tid,'message':f"Status diperbarui: {data.status}",'internal':False,'author_name':u['name'],'author_role':u['role'],'created_at':now(),'system':True})
    return ticket_public({**t,**update},u)

@router.get('/tickets/{tid}/comments',response_model=list[Record])
async def comments(tid:str,u=Depends(current_user)):
    await ticket_for(u,tid,'ticket.read')
    q={'ticket_id':tid}
    if u['role']=='Client': q['internal']=False
    return await db.ticket_comments.find(q,{'_id':0}).sort('created_at',1).to_list(1000)
@router.post('/tickets/{tid}/comments',response_model=Record)
async def add_comment(tid:str,data:CommentInput,u=Depends(current_user)):
    await ticket_for(u,tid,'ticket.read')
    if data.internal and u['role']=='Client': raise HTTPException(403,'Client tidak dapat membuat catatan internal.')
    c={**data.model_dump(),'id':uid(),'ticket_id':tid,'author_name':u['name'],'author_role':u['role'],'created_at':now(),'system':False}
    await db.ticket_comments.insert_one(c.copy())
    return c