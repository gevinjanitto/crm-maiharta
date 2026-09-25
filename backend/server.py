import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from core import db, client
from auth import router as auth_router
from projects import router as projects_router
from administration import router as admin_router
from tickets import router as tickets_router
from kanban import router as kanban_router
from finance import router as finance_router
from seed import seed, seed_cost_types, backfill_tasks

@asynccontextmanager
async def lifespan(app):
    await db.users.create_index('username', unique=True)
    await db.users.create_index('id', unique=True)
    await db.projects.create_index('id', unique=True)
    await db.captchas.create_index('expires_at', expireAfterSeconds=0)
    await db.sessions.create_index('expires_at', expireAfterSeconds=0)
    await db.login_attempts.create_index('created_at', expireAfterSeconds=600)
    await db.tasks.create_index('project_id')
    await seed()
    await seed_cost_types()
    await backfill_tasks()
    yield
    client.close()

app = FastAPI(title='CRM Maiharta', lifespan=lifespan)
api = APIRouter(prefix='/api')
@api.get('/')
async def root(): return {'name': 'CRM Maiharta', 'status': 'ok'}
@api.get('/health')
async def health(): return {'status': 'ok'}
for r in [auth_router, admin_router, projects_router, tickets_router, kanban_router, finance_router]: api.include_router(r)
app.include_router(api)

origins = [o.strip() for o in os.environ.get('CORS_ORIGINS', '').split(',') if o.strip()]
if os.environ.get('APP_ORIGIN'): origins.append(os.environ['APP_ORIGIN'])
cors = {'allow_origin_regex': '.*'} if '*' in origins or not origins else {'allow_origins': origins}
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_methods=['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'], **cors)
logging.basicConfig(level=logging.INFO)
