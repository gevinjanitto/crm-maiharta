from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from core import db, uid, now, authorize, project_scope, project_for, validate_assignee, MANAGERS
from auth import current_user
from schemas import Record, TaskInput, TaskUpdate, SubtaskInput, SubtaskUpdate
from documents import store_document
from mailer import notify_assignment

router = APIRouter()

async def enrich(tasks):
    ids = {t.get('assigned_to') for t in tasks} | {s.get('assigned_to') for t in tasks for s in t.get('subtasks', [])}
    users = await db.users.find({'id': {'$in': [i for i in ids if i]}}, {'_id': 0, 'id': 1, 'name': 1}).to_list(500)
    names = {r['id']: r['name'] for r in users}
    projects = await db.projects.find({'id': {'$in': list({t['project_id'] for t in tasks})}}, {'_id': 0, 'id': 1, 'name': 1}).to_list(2000)
    pnames = {p['id']: p['name'] for p in projects}
    counts = {}
    async for d in db.project_documents.aggregate([{'$match': {'task_id': {'$in': [t['id'] for t in tasks]}, 'is_deleted': False}}, {'$group': {'_id': '$task_id', 'n': {'$sum': 1}}}]): counts[d['_id']] = d['n']
    for t in tasks:
        t['assigned_name'] = names.get(t.get('assigned_to'), '')
        for s in t.get('subtasks', []): s['assigned_name'] = names.get(s.get('assigned_to'), '')
        t['project_name'] = pnames.get(t['project_id'], ''); t['document_count'] = counts.get(t['id'], 0)
    return tasks

async def create_task(pid, u, title, description='', status='Belum Mulai', server='Belum Naik', assigned_to='', due_date=None, priority='Sedang', source='manual', source_id='', subtasks=None):
    t = {'id': uid(), 'project_id': pid, 'title': title, 'description': description, 'status': status, 'server': server, 'assigned_to': assigned_to or '', 'due_date': due_date, 'priority': priority, 'source': source, 'source_id': source_id,
         'subtasks': [{'id': uid(), 'title': s.strip(), 'done': False, 'assigned_to': ''} for s in (subtasks or []) if s.strip()], 'created_at': now(), 'updated_at': now(), 'created_by': u['id']}
    await db.tasks.insert_one(t.copy())
    if assigned_to: await notify_assignment(assigned_to, 'task Kanban', title, pid, due_date)
    return t

async def sync_task_status(source, source_id, status):
    await db.tasks.update_many({'source': source, 'source_id': source_id}, {'$set': {'status': status, 'updated_at': now()}})

async def sync_source(t, status):
    if status not in ['Dikerjakan', 'Selesai']: return
    if t['source'] in ['revision', 'maintenance']:
        await db['revisions' if t['source'] == 'revision' else 'maintenances'].update_one({'id': t['source_id']}, {'$set': {'status': status, 'completed_at': now() if status == 'Selesai' else None}})
    if t['source'] == 'ticket':
        await db.tickets.update_one({'id': t['source_id'], 'status': {'$in': ['Diterima', 'Dikerjakan']}}, {'$set': {'status': status, 'updated_at': now()}})

def can_edit(u, t):
    if u['role'] in MANAGERS or (u['role'] == 'Developer' and (t.get('assigned_to') or '') in ['', u['id']]): return
    raise HTTPException(403, 'Task ini ditugaskan kepada developer lain.')

async def task_for(u, pid, tid, action='task.read'):
    p = await project_for(u, pid, action)
    t = await db.tasks.find_one({'id': tid, 'project_id': pid}, {'_id': 0})
    if not t: raise HTTPException(404, 'Task tidak ditemukan.')
    return p, t

@router.get('/tasks', response_model=list[Record])
async def all_tasks(u=Depends(current_user)):
    await authorize(u, 'task.read')
    pids = await db.projects.distinct('id', project_scope(u))
    return await enrich(await db.tasks.find({'project_id': {'$in': pids}}, {'_id': 0}).sort('created_at', -1).to_list(5000))

@router.get('/projects/{pid}/tasks', response_model=list[Record])
async def project_tasks(pid: str, u=Depends(current_user)):
    await project_for(u, pid, 'task.read')
    return await enrich(await db.tasks.find({'project_id': pid}, {'_id': 0}).sort('created_at', -1).to_list(2000))

@router.post('/projects/{pid}/tasks', response_model=Record)
async def add_task(pid: str, data: TaskInput, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write')
    await validate_assignee(data.assigned_to, p)
    t = await create_task(pid, u, **data.model_dump(mode='json'))
    return (await enrich([t]))[0]

@router.patch('/projects/{pid}/tasks/{tid}', response_model=Record)
async def edit_task(pid: str, tid: str, data: TaskUpdate, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    update = data.model_dump(mode='json', exclude_none=True)
    if u['role'] == 'Developer' and set(update) - {'status', 'server'}: raise HTTPException(403, 'Developer hanya dapat memperbarui status dan server.')
    if 'assigned_to' in update: await validate_assignee(update['assigned_to'], p)
    update['updated_at'] = now()
    await db.tasks.update_one({'id': tid}, {'$set': update})
    if update.get('assigned_to') and update['assigned_to'] != t.get('assigned_to'): await notify_assignment(update['assigned_to'], 'task Kanban', update.get('title', t['title']), pid, update.get('due_date', t.get('due_date')))
    if 'status' in update and update['status'] != t['status']: await sync_source(t, update['status'])
    return (await enrich([{**t, **update}]))[0]

@router.delete('/projects/{pid}/tasks/{tid}')
async def delete_task(pid: str, tid: str, u=Depends(current_user)):
    await task_for(u, pid, tid, 'task.write')
    await db.tasks.delete_one({'id': tid})
    await db.project_documents.update_many({'task_id': tid}, {'$set': {'is_deleted': True}})
    return {'message': 'Task dihapus.'}

@router.post('/projects/{pid}/tasks/{tid}/subtasks', response_model=Record)
async def add_subtask(pid: str, tid: str, data: SubtaskInput, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    await validate_assignee(data.assigned_to, p)
    s = {**data.model_dump(), 'id': uid(), 'done': False}
    await db.tasks.update_one({'id': tid}, {'$push': {'subtasks': s}, '$set': {'updated_at': now()}})
    if data.assigned_to: await notify_assignment(data.assigned_to, 'subtask', f"{data.title} ({t['title']})", pid, t.get('due_date'))
    return (await enrich([{**t, 'subtasks': t.get('subtasks', []) + [s]}]))[0]

@router.patch('/projects/{pid}/tasks/{tid}/subtasks/{sid}', response_model=Record)
async def edit_subtask(pid: str, tid: str, sid: str, data: SubtaskUpdate, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    subs = t.get('subtasks', []); s = next((x for x in subs if x['id'] == sid), None)
    if not s: raise HTTPException(404, 'Subtask tidak ditemukan.')
    update = data.model_dump(exclude_none=True)
    if update.get('assigned_to'): await validate_assignee(update['assigned_to'], p)
    if update.get('assigned_to') and update['assigned_to'] != s.get('assigned_to'): await notify_assignment(update['assigned_to'], 'subtask', f"{s['title']} ({t['title']})", pid, t.get('due_date'))
    s.update(update)
    await db.tasks.update_one({'id': tid}, {'$set': {'subtasks': subs, 'updated_at': now()}})
    return (await enrich([{**t, 'subtasks': subs}]))[0]

@router.delete('/projects/{pid}/tasks/{tid}/subtasks/{sid}')
async def delete_subtask(pid: str, tid: str, sid: str, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    await db.tasks.update_one({'id': tid}, {'$pull': {'subtasks': {'id': sid}}, '$set': {'updated_at': now()}})
    return {'message': 'Subtask dihapus.'}

@router.get('/projects/{pid}/tasks/{tid}/documents', response_model=list[Record])
async def task_documents(pid: str, tid: str, u=Depends(current_user)):
    await task_for(u, pid, tid)
    return await db.project_documents.find({'task_id': tid, 'is_deleted': False}, {'_id': 0, 'storage_path': 0}).sort('created_at', -1).to_list(200)

@router.post('/projects/{pid}/tasks/{tid}/documents', response_model=Record)
async def upload_task_document(pid: str, tid: str, file: UploadFile = File(...), u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    return await store_document(pid, u, file, 'Lampiran Task', 'Internal', tid)

@router.get('/notifications', response_model=list[Record])
async def notifications(u=Depends(current_user)):
    q = {} if u['role'] == 'Admin' else {'user_id': u['id']}
    return await db.notifications.find(q, {'_id': 0}).sort('created_at', -1).to_list(50)
