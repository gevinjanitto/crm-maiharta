from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from core import db, uid, now, authorize, project_scope, project_for, validate_assignee, project_statuses, recalc_progress, MANAGERS
from auth import current_user
from schemas import Record, TaskInput, TaskUpdate, SubtaskInput, SubtaskUpdate, StatusColumnInput, StatusColumnUpdate, ReorderInput, TaskCommentInput, TimeEntryInput, BulkTaskInput
from documents import store_document
from mailer import notify_assignment

router = APIRouter()

def kind_of(p, status): return next((s['kind'] for s in project_statuses(p) if s['name'] == status), 'active')
def status_names(p): return [s['name'] for s in project_statuses(p)]
def fallback_status(p, kind='todo'): return next((s['name'] for s in project_statuses(p) if s['kind'] == kind), status_names(p)[0])
def secs(e): return e.get('seconds') or 0

async def enrich(tasks, user=None):
    ids = {t.get('assigned_to') for t in tasks} | {s.get('assigned_to') for t in tasks for s in t.get('subtasks', [])}
    users = await db.users.find({'id': {'$in': [i for i in ids if i]}}, {'_id': 0, 'id': 1, 'name': 1}).to_list(500)
    names = {r['id']: r['name'] for r in users}
    projects = await db.projects.find({'id': {'$in': list({t['project_id'] for t in tasks})}}, {'_id': 0, 'id': 1, 'name': 1}).to_list(2000)
    pnames = {p['id']: p['name'] for p in projects}
    tids = [t['id'] for t in tasks]
    counts, comments = {}, {}
    async for d in db.project_documents.aggregate([{'$match': {'task_id': {'$in': tids}, 'is_deleted': False}}, {'$group': {'_id': '$task_id', 'n': {'$sum': 1}}}]): counts[d['_id']] = d['n']
    async for d in db.task_comments.aggregate([{'$match': {'task_id': {'$in': tids}}}, {'$group': {'_id': '$task_id', 'n': {'$sum': 1}}}]): comments[d['_id']] = d['n']
    for t in tasks:
        t['assigned_name'] = names.get(t.get('assigned_to'), '')
        for s in t.get('subtasks', []): s['assigned_name'] = names.get(s.get('assigned_to'), '')
        t['project_name'] = pnames.get(t['project_id'], ''); t['document_count'] = counts.get(t['id'], 0); t['comment_count'] = comments.get(t['id'], 0)
        entries = t.get('time_entries', [])
        t['time_total'] = sum(secs(e) for e in entries if e.get('ended_at'))
        t['running_entry'] = next((e for e in entries if not e.get('ended_at') and user and e['user_id'] == user['id']), None)
        t['running_count'] = sum(1 for e in entries if not e.get('ended_at'))
        t.setdefault('tags', []); t.setdefault('estimate_hours', 0); t.setdefault('order', 0); t.setdefault('start_date', None)
    return tasks

async def create_task(pid, u, title, description='', status='Belum Mulai', server='Belum Naik', assigned_to='', due_date=None, priority='Sedang', source='manual', source_id='', subtasks=None, tags=None, start_date=None, estimate_hours=0):
    p = await db.projects.find_one({'id': pid}, {'_id': 0}) or {}
    if status not in status_names(p): status = fallback_status(p)
    order = (await db.tasks.count_documents({'project_id': pid})) + 1
    t = {'id': uid(), 'project_id': pid, 'title': title, 'description': description, 'status': status, 'server': server, 'assigned_to': assigned_to or '', 'due_date': due_date, 'start_date': start_date, 'priority': priority, 'source': source, 'source_id': source_id,
         'tags': tags or [], 'estimate_hours': estimate_hours or 0, 'order': order, 'time_entries': [],
         'subtasks': [{'id': uid(), 'title': s.strip(), 'done': False, 'assigned_to': ''} for s in (subtasks or []) if s.strip()], 'created_at': now(), 'updated_at': now(), 'created_by': u['id']}
    await db.tasks.insert_one(t.copy())
    if assigned_to: await notify_assignment(assigned_to, 'task Kanban', title, pid, due_date)
    return t

async def sync_task_status(source, source_id, status):
    t = await db.tasks.find_one({'source': source, 'source_id': source_id}, {'_id': 0, 'project_id': 1})
    if not t: return
    p = await db.projects.find_one({'id': t['project_id']}, {'_id': 0}) or {}
    target = status if status in status_names(p) else fallback_status(p, {'Selesai': 'done', 'Dikerjakan': 'active'}.get(status, 'todo'))
    await db.tasks.update_many({'source': source, 'source_id': source_id}, {'$set': {'status': target, 'updated_at': now()}})

async def sync_source(t, status, p):
    kind, src, sid = kind_of(p, status), t.get('source'), t.get('source_id')
    if src in ['revision', 'maintenance']:
        s = {'done': 'Selesai', 'active': 'Dikerjakan', 'todo': 'Terbuka'}[kind]
        await db['revisions' if src == 'revision' else 'maintenances'].update_one({'id': sid}, {'$set': {'status': s, 'completed_at': now() if kind == 'done' else None}})
    elif src == 'ticket':
        if kind == 'done': await db.tickets.update_one({'id': sid, 'status': {'$in': ['Diterima', 'Dikerjakan']}}, {'$set': {'status': 'Selesai', 'updated_at': now()}})
        elif kind == 'active': await db.tickets.update_one({'id': sid, 'status': 'Diterima'}, {'$set': {'status': 'Dikerjakan', 'updated_at': now()}})
    elif src == 'feature':
        s = {'done': 'Selesai', 'active': 'Dikerjakan', 'todo': 'Belum dimulai'}[kind]
        await db.project_features.update_one({'id': sid}, {'$set': {'status': s}})
        await recalc_progress(t['project_id'])

def can_edit(u, t):
    if u['role'] in MANAGERS or (u['role'] == 'Developer' and (t.get('assigned_to') or '') in ['', u['id']]): return
    raise HTTPException(403, 'Task ini ditugaskan kepada developer lain.')

async def task_for(u, pid, tid, action='task.read'):
    p = await project_for(u, pid, action)
    t = await db.tasks.find_one({'id': tid, 'project_id': pid}, {'_id': 0})
    if not t: raise HTTPException(404, 'Task tidak ditemukan.')
    return p, t

async def one(tid, u):
    t = await db.tasks.find_one({'id': tid}, {'_id': 0})
    return (await enrich([t], u))[0]

# ---------- status columns ----------
@router.get('/projects/{pid}/statuses', response_model=list[Record])
async def get_statuses(pid: str, u=Depends(current_user)):
    return project_statuses(await project_for(u, pid, 'task.read'))

async def save_statuses(pid, cols):
    await db.projects.update_one({'id': pid}, {'$set': {'task_statuses': cols, 'updated_at': now()}})
    return cols

@router.post('/projects/{pid}/statuses', response_model=list[Record])
async def add_status(pid: str, data: StatusColumnInput, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write'); cols = project_statuses(p)
    if data.name in [c['name'] for c in cols]: raise HTTPException(400, 'Nama status sudah dipakai.')
    return await save_statuses(pid, cols + [{'id': uid(), **data.model_dump()}])

@router.patch('/projects/{pid}/statuses/{sid}', response_model=list[Record])
async def edit_status(pid: str, sid: str, data: StatusColumnUpdate, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write'); cols = project_statuses(p)
    c = next((x for x in cols if x['id'] == sid), None)
    if not c: raise HTTPException(404, 'Status tidak ditemukan.')
    update = data.model_dump(exclude_none=True)
    if update.get('name') and update['name'] != c['name']:
        if update['name'] in [x['name'] for x in cols]: raise HTTPException(400, 'Nama status sudah dipakai.')
        await db.tasks.update_many({'project_id': pid, 'status': c['name']}, {'$set': {'status': update['name']}})
    c.update(update)
    return await save_statuses(pid, cols)

@router.delete('/projects/{pid}/statuses/{sid}', response_model=list[Record])
async def delete_status(pid: str, sid: str, move_to: str = '', u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write'); cols = project_statuses(p)
    c = next((x for x in cols if x['id'] == sid), None)
    if not c: raise HTTPException(404, 'Status tidak ditemukan.')
    rest = [x for x in cols if x['id'] != sid]
    if not rest: raise HTTPException(400, 'Minimal harus ada satu status.')
    if move_to and move_to not in [x['name'] for x in rest]: raise HTTPException(400, 'Status tujuan tidak ditemukan.')
    target = move_to or rest[0]['name']
    await db.tasks.update_many({'project_id': pid, 'status': c['name']}, {'$set': {'status': target}})
    return await save_statuses(pid, rest)

@router.post('/projects/{pid}/statuses/reorder', response_model=list[Record])
async def reorder_statuses(pid: str, data: ReorderInput, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write'); cols = project_statuses(p)
    by_id = {c['id']: c for c in cols}
    ordered = [by_id[i] for i in data.ids if i in by_id] + [c for c in cols if c['id'] not in data.ids]
    return await save_statuses(pid, ordered)

# ---------- tasks ----------
@router.get('/tasks', response_model=list[Record])
async def all_tasks(u=Depends(current_user)):
    await authorize(u, 'task.read')
    pids = await db.projects.distinct('id', project_scope(u))
    return await enrich(await db.tasks.find({'project_id': {'$in': pids}}, {'_id': 0}).sort('order', 1).to_list(5000), u)

@router.get('/projects/{pid}/tasks', response_model=list[Record])
async def project_tasks(pid: str, u=Depends(current_user)):
    await project_for(u, pid, 'task.read')
    return await enrich(await db.tasks.find({'project_id': pid}, {'_id': 0}).sort('order', 1).to_list(2000), u)

@router.get('/projects/{pid}/tasks/stats')
async def task_stats(pid: str, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.read')
    tasks = await enrich(await db.tasks.find({'project_id': pid}, {'_id': 0}).to_list(2000), u)
    today = datetime.now(timezone.utc).date().isoformat(); week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    cols = project_statuses(p); done_names = {c['name'] for c in cols if c['kind'] == 'done'}
    by_assignee = {}
    for t in tasks:
        k = t['assigned_name'] or 'Belum ditugaskan'; a = by_assignee.setdefault(k, {'name': k, 'total': 0, 'done': 0, 'time': 0})
        a['total'] += 1; a['done'] += t['status'] in done_names; a['time'] += t['time_total']
    return {
        'total': len(tasks), 'done': sum(t['status'] in done_names for t in tasks),
        'overdue': sum(1 for t in tasks if t.get('due_date') and t['status'] not in done_names and t['due_date'] < today),
        'unassigned': sum(1 for t in tasks if not t.get('assigned_to')),
        'completed_week': sum(1 for t in tasks if t['status'] in done_names and t.get('updated_at', '') >= week_ago),
        'time_total': sum(t['time_total'] for t in tasks), 'estimate_total': sum(t.get('estimate_hours') or 0 for t in tasks),
        'by_status': [{'name': c['name'], 'color': c['color'], 'count': sum(t['status'] == c['name'] for t in tasks)} for c in cols],
        'by_priority': [{'name': pr, 'count': sum(t.get('priority') == pr for t in tasks)} for pr in ['Mendesak', 'Tinggi', 'Sedang', 'Rendah']],
        'by_assignee': sorted(by_assignee.values(), key=lambda a: -a['total']),
        'by_source': [{'name': s, 'count': sum(t.get('source') == s for t in tasks)} for s in ['manual', 'feature', 'revision', 'maintenance', 'ticket']],
    }

@router.post('/projects/{pid}/tasks', response_model=Record)
async def add_task(pid: str, data: TaskInput, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write')
    await validate_assignee(data.assigned_to, p)
    t = await create_task(pid, u, **data.model_dump(mode='json'))
    return (await enrich([t], u))[0]

@router.post('/projects/{pid}/tasks/bulk')
async def bulk_tasks(pid: str, data: BulkTaskInput, u=Depends(current_user)):
    p = await project_for(u, pid, 'task.write')
    q = {'id': {'$in': data.ids}, 'project_id': pid}
    if data.delete:
        await db.tasks.delete_many(q); await db.project_documents.update_many({'task_id': {'$in': data.ids}}, {'$set': {'is_deleted': True}})
        return {'message': f'{len(data.ids)} task dihapus.'}
    update = {k: v for k, v in data.model_dump(exclude_none=True).items() if k in ['status', 'assigned_to', 'priority']}
    if 'status' in update and update['status'] not in status_names(p): raise HTTPException(400, 'Status tidak valid.')
    if update.get('assigned_to'): await validate_assignee(update['assigned_to'], p)
    if not update: raise HTTPException(400, 'Tidak ada perubahan.')
    await db.tasks.update_many(q, {'$set': {**update, 'updated_at': now()}})
    if 'status' in update:
        async for t in db.tasks.find(q, {'_id': 0}): await sync_source(t, update['status'], p)
    return {'message': f'{len(data.ids)} task diperbarui.'}

@router.patch('/projects/{pid}/tasks/{tid}', response_model=Record)
async def edit_task(pid: str, tid: str, data: TaskUpdate, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    update = data.model_dump(mode='json', exclude_unset=True)
    for k in ['title', 'status', 'server', 'priority', 'tags', 'order', 'estimate_hours', 'description', 'assigned_to']:
        if k in update and update[k] is None: update.pop(k)
    if u['role'] == 'Developer' and set(update) - {'status', 'server', 'order'}: raise HTTPException(403, 'Developer hanya dapat memperbarui status, server, dan urutan.')
    if 'status' in update and update['status'] not in status_names(p): raise HTTPException(400, 'Status tidak valid.')
    if 'assigned_to' in update: await validate_assignee(update['assigned_to'], p)
    if 'tags' in update: update['tags'] = [x.strip() for x in update['tags'] if x.strip()][:10]
    update['updated_at'] = now()
    await db.tasks.update_one({'id': tid}, {'$set': update})
    if update.get('assigned_to') and update['assigned_to'] != t.get('assigned_to'): await notify_assignment(update['assigned_to'], 'task Kanban', update.get('title', t['title']), pid, update.get('due_date', t.get('due_date')))
    if 'status' in update and update['status'] != t['status']: await sync_source(t, update['status'], p)
    return await one(tid, u)

@router.delete('/projects/{pid}/tasks/{tid}')
async def delete_task(pid: str, tid: str, u=Depends(current_user)):
    await task_for(u, pid, tid, 'task.write')
    await db.tasks.delete_one({'id': tid})
    await db.project_documents.update_many({'task_id': tid}, {'$set': {'is_deleted': True}})
    await db.task_comments.delete_many({'task_id': tid})
    return {'message': 'Task dihapus.'}

# ---------- subtasks ----------
@router.post('/projects/{pid}/tasks/{tid}/subtasks', response_model=Record)
async def add_subtask(pid: str, tid: str, data: SubtaskInput, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    await validate_assignee(data.assigned_to, p)
    s = {**data.model_dump(), 'id': uid(), 'done': False}
    await db.tasks.update_one({'id': tid}, {'$push': {'subtasks': s}, '$set': {'updated_at': now()}})
    if data.assigned_to: await notify_assignment(data.assigned_to, 'subtask', f"{data.title} ({t['title']})", pid, t.get('due_date'))
    return await one(tid, u)

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
    return await one(tid, u)

@router.delete('/projects/{pid}/tasks/{tid}/subtasks/{sid}')
async def delete_subtask(pid: str, tid: str, sid: str, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    await db.tasks.update_one({'id': tid}, {'$pull': {'subtasks': {'id': sid}}, '$set': {'updated_at': now()}})
    return {'message': 'Subtask dihapus.'}

# ---------- comments ----------
@router.get('/projects/{pid}/tasks/{tid}/comments', response_model=list[Record])
async def task_comments(pid: str, tid: str, u=Depends(current_user)):
    await task_for(u, pid, tid)
    return await db.task_comments.find({'task_id': tid}, {'_id': 0}).sort('created_at', 1).to_list(1000)

@router.post('/projects/{pid}/tasks/{tid}/comments', response_model=Record)
async def add_comment(pid: str, tid: str, data: TaskCommentInput, u=Depends(current_user)):
    await task_for(u, pid, tid)
    c = {'id': uid(), 'task_id': tid, 'project_id': pid, 'message': data.message, 'author_id': u['id'], 'author_name': u['name'], 'author_role': u['role'], 'created_at': now()}
    await db.task_comments.insert_one(c.copy())
    return c

@router.delete('/projects/{pid}/tasks/{tid}/comments/{cid}')
async def delete_comment(pid: str, tid: str, cid: str, u=Depends(current_user)):
    await task_for(u, pid, tid)
    q = {'id': cid, 'task_id': tid}
    if u['role'] not in MANAGERS: q['author_id'] = u['id']
    r = await db.task_comments.delete_one(q)
    if not r.deleted_count: raise HTTPException(404, 'Komentar tidak ditemukan.')
    return {'message': 'Komentar dihapus.'}

# ---------- time tracking ----------
@router.post('/projects/{pid}/tasks/{tid}/timer', response_model=Record)
async def toggle_timer(pid: str, tid: str, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    entries = t.get('time_entries', [])
    running = next((e for e in entries if not e.get('ended_at') and e['user_id'] == u['id']), None)
    if running:
        started = datetime.fromisoformat(running['started_at'])
        running['ended_at'] = now(); running['seconds'] = max(1, int((datetime.now(timezone.utc) - started).total_seconds()))
    else:
        entries.append({'id': uid(), 'user_id': u['id'], 'user_name': u['name'], 'started_at': now(), 'ended_at': None, 'seconds': 0, 'note': '', 'manual': False})
    await db.tasks.update_one({'id': tid}, {'$set': {'time_entries': entries, 'updated_at': now()}})
    return await one(tid, u)

@router.post('/projects/{pid}/tasks/{tid}/time', response_model=Record)
async def add_time(pid: str, tid: str, data: TimeEntryInput, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress'); can_edit(u, t)
    at = datetime.combine(data.date, datetime.min.time(), tzinfo=timezone.utc).isoformat() if data.date else now()
    e = {'id': uid(), 'user_id': u['id'], 'user_name': u['name'], 'started_at': at, 'ended_at': at, 'seconds': data.minutes * 60, 'note': data.note, 'manual': True}
    await db.tasks.update_one({'id': tid}, {'$push': {'time_entries': e}, '$set': {'updated_at': now()}})
    return await one(tid, u)

@router.delete('/projects/{pid}/tasks/{tid}/time/{eid}', response_model=Record)
async def delete_time(pid: str, tid: str, eid: str, u=Depends(current_user)):
    p, t = await task_for(u, pid, tid, 'task.progress')
    e = next((x for x in t.get('time_entries', []) if x['id'] == eid), None)
    if not e: raise HTTPException(404, 'Catatan waktu tidak ditemukan.')
    if u['role'] not in MANAGERS and e['user_id'] != u['id']: raise HTTPException(403, 'Hanya pemilik catatan yang dapat menghapus.')
    await db.tasks.update_one({'id': tid}, {'$pull': {'time_entries': {'id': eid}}, '$set': {'updated_at': now()}})
    return await one(tid, u)

# ---------- documents ----------
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
