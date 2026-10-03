import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Literal
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from core import db, uid, now, authorize, project_for, project_statuses, MANAGERS, log_activity, validate_assignee
from auth import current_user
from clickup_parser import FIELDS, parse_csv, split_values, normalize_rows, stable_id

router = APIRouter(prefix='/imports/clickup')


class MappingInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    columns: dict[str, str]
    status_map: dict[str, str] = Field(default_factory=dict)
    user_map: dict[str, str] = Field(default_factory=dict)
    date_order: Literal['DMY','MDY'] = 'DMY'
    estimate_unit: Literal['milliseconds','minutes','hours'] = 'milliseconds'


class CommitInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    preview_hash: str
    confirm: Literal[True]


class AnalyzeResponse(BaseModel):
    session_id: str
    headers: list[str]
    columns: dict[str, str]
    row_count: int
    sample: list[dict]
    people: list[dict]
    statuses: list[dict]
    source_statuses: list[str]
    source_assignees: list[str]
    user_map: dict[str, str]
    status_map: dict[str, str]


class PreviewResponse(BaseModel):
    valid: bool
    preview_hash: str
    tasks: int
    subtasks: int
    duplicates: int
    rows: list[dict]
    errors: list[dict]
    warnings: list[str]
    source_statuses: list[str]
    source_assignees: list[str]


class CommitResponse(BaseModel):
    imported: int
    skipped: int
    subtasks_imported: int
    project_id: str


async def people_for(project):
    return await db.users.find({'active': True, '$or': [{'role': {'$in': MANAGERS}}, {'role': 'Developer', 'id': {'$in': project.get('assigned_to', [])}}]}, {'_id': 0, 'id': 1, 'name': 1, 'role': 1, 'username': 1, 'email': 1}).to_list(500)


def sources(rows, columns):
    statuses = sorted({r.get(columns.get('status', ''), '') for r in rows} - {''})
    people = sorted({name for r in rows for name in split_values(r.get(columns.get('assignees', ''), ''))})
    return statuses, people


async def session_for(sid, user):
    await authorize(user, 'import.manage')
    session = await db.clickup_import_sessions.find_one({'id': sid, 'user_id': user['id'], 'expires_at': {'$gt': datetime.now(timezone.utc)}}, {'_id': 0})
    if not session: raise HTTPException(404, 'Sesi impor tidak ditemukan atau kedaluwarsa.')
    project = await project_for(user, session['project_id'], 'task.write')
    return session, project


@router.post('/analyze', response_model=AnalyzeResponse)
async def analyze(project_id: str = Form(...), file: UploadFile = File(...), u=Depends(current_user)):
    await authorize(u, 'import.manage')
    project = await project_for(u, project_id, 'task.write')
    if not (file.filename or '').lower().endswith('.csv'): raise HTTPException(400, 'Unggah file CSV ClickUp.')
    content = await file.read(2 * 1024 * 1024 + 1)
    if len(content) > 2 * 1024 * 1024: raise HTTPException(413, 'CSV maksimal 2 MB.')
    try: headers, rows, columns = parse_csv(content)
    except ValueError as exc: raise HTTPException(400, str(exc))
    sid = uid()
    await db.clickup_import_sessions.insert_one({'id': sid, 'user_id': u['id'], 'project_id': project_id, 'headers': headers, 'rows': rows, 'filename': file.filename, 'created_at': now(), 'expires_at': datetime.now(timezone.utc) + timedelta(hours=24)})
    people, statuses = await people_for(project), project_statuses(project)
    source_statuses, source_people = sources(rows, columns)
    user_map = {}
    for source in source_people:
        matches = [p for p in people if source.lower() in [str(p.get(k,'')).lower() for k in ['name','email','username']]]
        if len(matches) == 1: user_map[source] = matches[0]['id']
    aliases = {'to do':'Belum Mulai','todo':'Belum Mulai','open':'Belum Mulai','in progress':'Dikerjakan','in review':'Testing','complete':'Selesai','closed':'Selesai','done':'Selesai'}
    status_map = {}
    for source in source_statuses:
        target = aliases.get(source.lower(), source)
        match = next((s['name'] for s in statuses if s['name'].lower() == target.lower()), None)
        if match: status_map[source] = match
    return {'session_id': sid, 'headers': headers, 'columns': columns, 'row_count': len(rows), 'sample': rows[:5], 'people': people, 'statuses': statuses, 'source_statuses': source_statuses, 'source_assignees': source_people, 'user_map': user_map, 'status_map': status_map}


@router.post('/{sid}/preview', response_model=PreviewResponse)
async def preview(sid: str, data: MappingInput, u=Depends(current_user)):
    session, project = await session_for(sid, u)
    if session.get('result'): raise HTTPException(409, 'Sesi ini sudah diimpor. Unggah kembali untuk impor lain.')
    if session.get('processing_until') and session['processing_until'].replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        raise HTTPException(409, 'Impor sedang berjalan. Tunggu sampai selesai.')
    if set(data.columns) - set(FIELDS) or any(v and v not in session['headers'] for v in data.columns.values()):
        raise HTTPException(400, 'Pemetaan kolom tidak valid.')
    if not data.columns.get('external_id') or not data.columns.get('title'): raise HTTPException(400, 'Petakan kolom Task ID dan Nama task.')
    mapped = [v for v in data.columns.values() if v]
    if len(mapped) != len(set(mapped)): raise HTTPException(400, 'Satu kolom CSV tidak boleh dipetakan ke dua field.')
    rows, errors = normalize_rows(session['rows'], data.columns, data.status_map, data.user_map, project_statuses(project), await people_for(project), project['id'], data.date_order, data.estimate_unit)
    roots = [r for r in rows if not r['parent_external_id']]
    duplicates = await db.tasks.count_documents({'project_id': project['id'], 'id': {'$in': [r['id'] for r in roots]}})
    digest = hashlib.sha256(json.dumps({'rows': rows, 'mapping': data.model_dump()}, sort_keys=True).encode()).hexdigest()
    saved = await db.clickup_import_sessions.update_one({'id': sid, 'user_id': u['id'], 'result': {'$exists': False}, '$or': [{'processing_until': {'$exists': False}}, {'processing_until': {'$lte': datetime.now(timezone.utc)}}]}, {'$set': {'plan': rows, 'mapping': data.model_dump(), 'preview_hash': digest, 'valid': not errors}})
    if not saved.matched_count: raise HTTPException(409, 'Sesi sedang diproses atau telah selesai.')
    statuses, people = sources(session['rows'], data.columns)
    warnings = ['CSV hanya memuat data yang diekspor. Komentar, file lampiran, Docs, automasi, dan riwayat tidak diimpor sebagai fitur aktif.', 'Task ID yang sudah ada di project tujuan dilewati, termasuk subtasks-nya; tidak ada data lama yang ditimpa.']
    if any(v == '__unassigned__' for v in data.user_map.values()): warnings.append('PIC yang dipetakan ke Tanpa PIC tidak akan ditugaskan.')
    return {'valid': not errors, 'preview_hash': digest, 'tasks': len(roots), 'subtasks': len(rows)-len(roots), 'duplicates': duplicates, 'rows': [{k:v for k,v in r.items() if k != 'description'} for r in rows[:25]], 'errors': errors[:100], 'warnings': warnings, 'source_statuses': statuses, 'source_assignees': people}


async def import_list(pid, row):
    if not any(row[k] for k in ['space','folder','list']): return ''
    parent = ''
    for kind, name in [('space', row['space'] or 'ClickUp'), ('folder', row['folder']), ('list', row['list'] or 'Impor ClickUp')]:
        if not name: continue
        node_id = stable_id(pid, f'node:{parent}:{kind}:{name}')
        await db.workspace_nodes.update_one({'id': node_id}, {'$setOnInsert': {'id': node_id, 'project_id': pid, 'kind': kind, 'name': name, 'parent_id': parent, 'color': '#3b82f6', 'created_at': now()}}, upsert=True)
        parent = node_id
    return parent


@router.post('/{sid}/commit', response_model=CommitResponse)
async def commit(sid: str, data: CommitInput, u=Depends(current_user)):
    session, project = await session_for(sid, u)
    if data.preview_hash != session.get('preview_hash') or not session.get('valid'): raise HTTPException(409, 'Pratinjau tidak valid atau berubah. Jalankan pratinjau kembali.')
    if session.get('result'): return session['result']
    locked = await db.clickup_import_sessions.update_one({'id': sid, 'user_id': u['id'], 'preview_hash': data.preview_hash, 'result': {'$exists': False}, '$or': [{'processing_until': {'$exists': False}}, {'processing_until': {'$lte': datetime.now(timezone.utc)}}]}, {'$set': {'processing_until': datetime.now(timezone.utc) + timedelta(minutes=10)}})
    if not locked.modified_count: raise HTTPException(409, 'Sesi sedang diproses atau pratinjau berubah. Muat ulang sebelum mencoba lagi.')
    try:
        return await commit_plan(session, project, u)
    finally:
        await db.clickup_import_sessions.update_one({'id': sid}, {'$unset': {'processing_until': ''}})


async def commit_plan(session, project, u):
    sid = session['id']
    rows = session['plan']
    statuses = project_statuses(project)
    if any(r['status'] not in {s['name'] for s in statuses} for r in rows): raise HTTPException(409, 'Status project berubah. Jalankan pratinjau kembali.')
    for person in {i for r in rows for i in r['assignee_ids']}: await validate_assignee(person, project)
    done = {s['name'] for s in statuses if s['kind'] == 'done'}
    result = {'imported': 0, 'skipped': 0, 'subtasks_imported': 0, 'project_id': project['id']}
    for row in [r for r in rows if not r['parent_external_id']]:
        if await db.tasks.find_one({'id': row['id']}, {'_id': 0, 'id': 1}):
            result['skipped'] += 1
            continue
        children = [r for r in rows if r['parent_external_id'] == row['external_id']]
        task = {k:row[k] for k in ['id','title','description','status','assignee_ids','assigned_to','start_date','due_date','priority','tags','estimate_hours']}
        task.update(project_id=project['id'], source='clickup', source_id=row['external_id'], server='Belum Naik', order=row['csv_row'], list_id=await import_list(project['id'], row), sprint_id='', milestone=False, custom_fields={}, dependencies=[], time_entries=[], reminder_at=None, reminder_sent_at=None, created_at=now(), updated_at=now(), imported_at=now(), created_by=u['id'], completed_at=now() if row['status'] in done else None)
        task['subtasks'] = [{'id': c['id'], 'title': c['title'], 'done': c['status'] in done, 'assigned_to': c['assigned_to'], 'clickup_id': c['external_id']} for c in children]
        inserted = await db.tasks.update_one({'id': task['id']}, {'$setOnInsert': task}, upsert=True)
        if inserted.upserted_id:
            result['imported'] += 1
            result['subtasks_imported'] += len(children)
        else: result['skipped'] += 1
    # Keep all original CSV fields for provenance, without exposing them via task reads.
    await db.clickup_import_records.update_one({'id': sid}, {'$setOnInsert': {'id': sid, 'project_id': project['id'], 'user_id': u['id'], 'filename': session['filename'], 'rows': session['rows'], 'mapping': session['mapping'], 'created_at': now()}}, upsert=True)
    await db.clickup_import_sessions.update_one({'id': sid}, {'$set': {'result': result}})
    await log_activity(u, 'impor ClickUp', 'project', project['id'], project['name'], project['id'], result)
    return result