import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException

load_dotenv(Path(__file__).parent / '.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
def now(): return datetime.now(timezone.utc).isoformat()
def uid(): return str(uuid.uuid4())
ROLES = ['Admin', 'Admin Project', 'Developer', 'Accounting', 'Client']
STATUSES = ['Project Masuk', 'Dokumen Disiapkan', 'Scope Dirinci', 'UI/UX', 'Disetujui', 'Development', 'Uploaded to Dev Server', 'Testing', 'Revisi', 'Uploaded to Production', 'Selesai']
TICKET_STATUSES = ['Baru', 'Ditinjau', 'Menunggu Klarifikasi', 'Diterima', 'Ditolak', 'Menunggu Estimasi Biaya', 'Menunggu Persetujuan', 'Dikerjakan', 'Selesai', 'Ditutup']
<<<<<<< HEAD
TASK_STATUSES = ['Belum Mulai', 'Dikerjakan', 'Testing', 'Revisi', 'Selesai']
SERVER_STAGES = ['Belum Naik', 'Dev Server', 'Production']
DEFAULT_CLIENT_PASSWORD = '12345678'
MANAGERS = ['Admin', 'Admin Project']
FINANCE = ['Admin', 'Accounting']
PERMISSIONS = {
    'task.read': ROLES, 'task.write': MANAGERS, 'task.progress': MANAGERS + ['Developer'],
    'costtype.read': FINANCE, 'costtype.write': FINANCE, 'expense.write': FINANCE,
=======
MANAGERS = ['Admin', 'Admin Project']
FINANCE = ['Admin', 'Accounting']
PERMISSIONS = {
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
    'project.read': ROLES, 'project.write': MANAGERS, 'project.status': MANAGERS + ['Developer'],
    'client.read': MANAGERS + ['Accounting'], 'client.write': MANAGERS,
    'user.manage': ['Admin'], 'team.read': MANAGERS,
    'feature.read': ROLES, 'feature.write': MANAGERS, 'feature.progress': MANAGERS + ['Developer'],
    'cost.read': FINANCE, 'cost.write': ['Admin'],
    'document.read': ROLES, 'document.write': MANAGERS,
    'revision.read': MANAGERS + ['Developer'], 'revision.write': MANAGERS,
    'maintenance.read': MANAGERS + ['Developer'], 'maintenance.write': MANAGERS,
    'deployment.read': MANAGERS + ['Developer'], 'deployment.write': MANAGERS + ['Developer'],
    'ticket.read': MANAGERS + ['Developer', 'Client'], 'ticket.create': MANAGERS + ['Client'],
    'ticket.triage': MANAGERS, 'ticket.progress': MANAGERS + ['Developer', 'Client'],
    'dashboard.read': ROLES, 'history.read': ROLES,
}
async def authorize(user, action, resource=None):
    allowed = user['role'] in PERMISSIONS.get(action, [])
    await db.audit_logs.insert_one({'id': uid(), 'user_id': user['id'], 'action': action, 'resource_id': (resource or {}).get('id'), 'allowed': allowed, 'created_at': now()})
    if not allowed: raise HTTPException(403, 'Anda tidak memiliki izin untuk tindakan ini.')

def project_scope(user):
    if user['role'] == 'Client': return {'client_id': user.get('client_id') or '__none__'}
    if user['role'] == 'Developer': return {'assigned_to': user['id']}
    return {}

async def project_for(user, project_id, action='project.read'):
    p = await db.projects.find_one({'$and': [project_scope(user), {'id': project_id}]}, {'_id': 0})
    if not p: raise HTTPException(404, 'Project tidak ditemukan.')
    await authorize(user, action, p)
    return p

def project_public(p, user):
    fields = ['id','code','name','description','client_id','client_name','category','type','status','progress','start_date','due_date','assigned_to','created_at','updated_at','production_at','tickets_closed']
    if user['role'] in MANAGERS + ['Accounting']: fields += ['value']
<<<<<<< HEAD
    if user['role'] in FINANCE: fields += ['development_cost','server_cost','other_cost']
=======
    if user['role'] in FINANCE: fields += ['development_cost','server_cost']
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
    if user['role'] in MANAGERS + ['Developer']: fields += ['internal_notes']
    return {k: p[k] for k in fields if k in p}

async def log_event(project_id, user, message, **extra):
    doc = {'id': uid(), 'project_id': project_id, 'user_name': user['name'], 'message': message, 'created_at': now(), **extra}
    await db.project_status_logs.insert_one(doc)

async def validate_assignee(user_id, project=None):
    if not user_id: return
    u = await db.users.find_one({'id': user_id, 'role': 'Developer', 'active': True}, {'_id': 0, 'id': 1})
    if not u or (project and user_id not in project.get('assigned_to', [])):
        raise HTTPException(400, 'PIC harus developer aktif yang ditugaskan pada project.')