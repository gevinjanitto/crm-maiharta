"""Buat token sesi langsung dari DB (untuk pengujian saat reCAPTCHA aktif).
Pakai: python3 /app/tests/make_token.py admin
"""
import os, sys, uuid, jwt, asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path('/app/backend/.env'))

async def main(username):
    db = AsyncIOMotorClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
    u = await db.users.find_one({'username': username}, {'_id': 0})
    if not u: raise SystemExit('user tidak ditemukan')
    sid = str(uuid.uuid4()); exp = datetime.now(timezone.utc) + timedelta(hours=8)
    await db.sessions.insert_one({'id': sid, 'user_id': u['id'], 'expires_at': exp})
    print(jwt.encode({'sub': u['id'], 'jti': sid, 'exp': exp}, os.environ['JWT_SECRET'], algorithm='HS256'))

asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'admin'))
