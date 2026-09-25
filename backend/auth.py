import os, secrets, hashlib, bcrypt, jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from core import db, uid, now
from schemas import Login, PasswordChange

router = APIRouter(prefix='/auth')
SECRET = os.environ['JWT_SECRET']
def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p, hashed):
    try: return bcrypt.checkpw(p.encode(), hashed.encode())
    except ValueError: return False
def public_user(u): return {k: u.get(k) for k in ['id','name','username','email','role','client_id','active']} | {'must_change_password': bool(u.get('must_change_password'))}

async def current_user(request: Request):
    bearer = request.headers.get('Authorization', '')
    token = bearer[7:] if bearer.startswith('Bearer ') else request.cookies.get('maiharta_session')
    if not token: raise HTTPException(401, 'Silakan masuk terlebih dahulu.')
    try:
        payload = jwt.decode(token, SECRET, algorithms=['HS256'])
        u = await db.users.find_one({'id': payload['sub'], 'active': True}, {'_id': 0})
        session = await db.sessions.find_one({'id': payload['jti'], 'user_id': payload['sub']}, {'_id': 0})
        if not u or not session: raise ValueError()
        return u
    except Exception: raise HTTPException(401, 'Sesi berakhir. Silakan masuk kembali.')

@router.get('/captcha')
async def captcha():
    a, b = secrets.randbelow(18) + 2, secrets.randbelow(9) + 1
    cid = uid()
    await db.captchas.insert_one({'id': cid, 'answer': hashlib.sha256(str(a+b).encode()).hexdigest(), 'expires_at': datetime.now(timezone.utc) + timedelta(minutes=5)})
    return {'id': cid, 'question': f'{a} + {b} = ?'}

@router.post('/login')
async def login(data: Login, request: Request, response: Response):
    key = hashlib.sha256(data.username.lower().encode()).hexdigest()
    attempts = await db.login_attempts.count_documents({'key': key, 'created_at': {'$gt': datetime.now(timezone.utc)-timedelta(minutes=10)}})
    if attempts >= 15: raise HTTPException(429, 'Terlalu banyak percobaan. Coba lagi dalam 10 menit.')
    c = await db.captchas.find_one_and_delete({'id': data.captcha_id}, projection={'_id':0})
    valid = c and c['expires_at'].replace(tzinfo=timezone.utc) > datetime.now(timezone.utc) and secrets.compare_digest(c['answer'], hashlib.sha256(data.captcha_answer.encode()).hexdigest())
    if not valid:
        await db.login_attempts.insert_one({'key': key, 'created_at': datetime.now(timezone.utc)})
        raise HTTPException(400, 'Jawaban CAPTCHA salah atau sudah kedaluwarsa.')
    u = await db.users.find_one({'username': data.username.lower(), 'active': True}, {'_id':0})
    if not u or not verify_password(data.password, u['password_hash']):
        await db.login_attempts.insert_one({'key': key, 'created_at': datetime.now(timezone.utc)})
        raise HTTPException(401, 'Username atau password tidak sesuai.')
    seconds = 604800 if data.remember else 28800
    sid = uid()
    expires = datetime.now(timezone.utc)+timedelta(seconds=seconds)
    await db.sessions.insert_one({'id':sid, 'user_id':u['id'], 'expires_at':expires})
    token = jwt.encode({'sub':u['id'], 'jti':sid, 'exp':expires}, SECRET, algorithm='HS256')
    response.set_cookie('maiharta_session',token,httponly=True,secure=True,samesite='none',max_age=seconds,path='/')
    return {'token':token,'user':public_user(u)}

@router.get('/me')
async def me(u=Depends(current_user)): return public_user(u)

@router.post('/logout')
async def logout(request: Request, response: Response):
    token = request.cookies.get('maiharta_session') or request.headers.get('Authorization','')[7:]
    try:
        payload = jwt.decode(token,SECRET,algorithms=['HS256'])
        await db.sessions.delete_one({'id':payload['jti']})
    except Exception: pass
    response.delete_cookie('maiharta_session',path='/',secure=True,samesite='none')
    return {'message':'Anda sudah keluar.'}

@router.post('/password')
async def change_password(data: PasswordChange, u=Depends(current_user)):
    if not verify_password(data.current_password,u['password_hash']): raise HTTPException(400,'Password saat ini tidak sesuai.')
    await db.users.update_one({'id':u['id']},{'$set':{'password_hash':hash_password(data.new_password),'must_change_password':False}})
    await db.sessions.delete_many({'user_id':u['id']})
    return {'message':'Password diubah. Silakan masuk kembali.'}