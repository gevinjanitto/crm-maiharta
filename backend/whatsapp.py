"""Official Meta fixed-template sender and signed delivery callbacks."""
import hashlib
import hmac
import os
import re
import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from core import db, now

router = APIRouter(prefix='/webhooks/whatsapp')
CONFIG_KEYS = ['META_GRAPH_BASE_URL', 'META_GRAPH_VERSION', 'META_PHONE_NUMBER_ID', 'META_ACCESS_TOKEN', 'META_TEMPLATE_NAME', 'META_TEMPLATE_LANGUAGE', 'META_APP_SECRET', 'META_WEBHOOK_VERIFY_TOKEN']


def whatsapp_configured():
    return all(os.environ.get(key) for key in CONFIG_KEYS)


def normalize_phone(value):
    number = re.sub(r'[\s().-]', '', value or '')
    if number.startswith('08'): number = '+62' + number[1:]
    elif number.startswith('62'): number = '+' + number
    if number and not re.fullmatch(r'\+[1-9][0-9]{7,14}', number):
        raise ValueError('Nomor WhatsApp harus berformat internasional, misalnya +628123456789.')
    return number


async def send_whatsapp(phone):
    url = '/'.join([os.environ['META_GRAPH_BASE_URL'].rstrip('/'), os.environ['META_GRAPH_VERSION'], os.environ['META_PHONE_NUMBER_ID'], 'messages'])
    payload = {'messaging_product': 'whatsapp', 'recipient_type': 'individual', 'to': normalize_phone(phone).lstrip('+'), 'type': 'template', 'template': {'name': os.environ['META_TEMPLATE_NAME'], 'language': {'code': os.environ['META_TEMPLATE_LANGUAGE']}}}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(url, headers={'Authorization': 'Bearer ' + os.environ['META_ACCESS_TOKEN']}, json=payload)
    response.raise_for_status()
    return response.json()['messages'][0]['id']


@router.get('')
async def verify(request: Request):
    expected = os.environ.get('META_WEBHOOK_VERIFY_TOKEN', '')
    if not expected or request.query_params.get('hub.mode') != 'subscribe' or not hmac.compare_digest(request.query_params.get('hub.verify_token', ''), expected):
        raise HTTPException(403, 'Verifikasi webhook gagal.')
    return Response(request.query_params.get('hub.challenge', ''), media_type='text/plain')


@router.post('')
async def callback(request: Request):
    secret = os.environ.get('META_APP_SECRET')
    if not secret: raise HTTPException(503, 'WhatsApp belum dikonfigurasi.')
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > 1024 * 1024: raise HTTPException(413, 'Payload terlalu besar.')
        chunks.append(chunk)
    raw = b''.join(chunks)
    signature = 'sha256=' + hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, request.headers.get('x-hub-signature-256', '')):
        raise HTTPException(401, 'Signature tidak valid.')
    import json
    try: payload = json.loads(raw)
    except ValueError: raise HTTPException(400, 'JSON tidak valid.')
    if not isinstance(payload, dict): raise HTTPException(400, 'Payload tidak valid.')
    for entry in payload.get('entry', []):
        for change in entry.get('changes', []):
            value = change.get('value', {})
            for status in value.get('statuses', []):
                state = status.get('status')
                if state not in ['sent', 'delivered', 'read', 'failed']: continue
                # Never regress a delivered/read receipt when callbacks arrive out of order.
                earlier = {'sent':['accepted'], 'delivered':['accepted','sent'], 'read':['accepted','sent','delivered'], 'failed':['accepted','sent']}[state]
                await db.notification_deliveries.update_one({'provider_id': status.get('id'), 'channel': 'whatsapp', 'status': {'$in': earlier}}, {'$set': {'status': state, 'updated_at': now()}})
            for message in value.get('messages', []):
                if (message.get('text', {}).get('body', '').strip().lower() in ['stop', 'berhenti', 'nonaktifkan']):
                    try: phone = normalize_phone('+' + message.get('from', ''))
                    except ValueError: continue
                    await db.users.update_many({'whatsapp_number': phone}, {'$set': {'notification_preferences.whatsapp': False, 'whatsapp_opt_out_at': now()}})
    return {'ok': True}