from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, ConfigDict, model_validator
from core import db, now, log_activity
from auth import current_user
from mailer import email_configured
from whatsapp import whatsapp_configured, normalize_phone

router = APIRouter(prefix='/account/notifications')
DEFAULT_PREFERENCES = {'in_app': True, 'email': True, 'whatsapp': False}


class NotificationPreferences(BaseModel):
    model_config = ConfigDict(extra='forbid')
    in_app: bool = True
    email: bool = True
    whatsapp: bool = False
    whatsapp_number: str = Field(default='', max_length=30)

    @model_validator(mode='after')
    def validate_phone(self):
        self.whatsapp_number = normalize_phone(self.whatsapp_number)
        if self.whatsapp and not self.whatsapp_number: raise ValueError('Isi nomor WhatsApp sebelum mengaktifkan notifikasi.')
        return self


class PreferencesResponse(NotificationPreferences):
    registered_email: str
    email_configured: bool
    whatsapp_configured: bool


def public_settings(user):
    return {**DEFAULT_PREFERENCES, **user.get('notification_preferences', {}), 'whatsapp_number': user.get('whatsapp_number', ''), 'registered_email': user.get('email', ''), 'email_configured': email_configured(), 'whatsapp_configured': whatsapp_configured()}


@router.get('', response_model=PreferencesResponse)
async def get_preferences(u=Depends(current_user)):
    return public_settings(u)


@router.patch('', response_model=PreferencesResponse)
async def save_preferences(data: NotificationPreferences, u=Depends(current_user)):
    updates = {'notification_preferences': data.model_dump(exclude={'whatsapp_number'}), 'whatsapp_number': data.whatsapp_number}
    if data.whatsapp and (not u.get('notification_preferences', {}).get('whatsapp') or u.get('whatsapp_number') != data.whatsapp_number):
        updates.update(whatsapp_opt_in_at=now(), whatsapp_opt_in_source='account_settings')
    if not data.whatsapp: updates['whatsapp_opt_out_at'] = now()
    await db.users.update_one({'id': u['id']}, {'$set': updates})
    await log_activity(u, 'ubah preferensi', 'notifikasi', u['id'], '', details=data.model_dump(exclude={'whatsapp_number'}))
    return public_settings({**u, **updates})


class DeliveryResponse(BaseModel):
    id: str
    channel: str
    status: str
    created_at: str
    reason: str = ''


@router.get('/deliveries', response_model=list[DeliveryResponse])
async def deliveries(u=Depends(current_user)):
    return await db.notification_deliveries.find({'user_id': u['id']}, {'_id': 0}).sort('created_at', -1).to_list(20)


@router.post('/test')
async def test_notification(u=Depends(current_user)):
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=60)).isoformat()
    result = await db.users.update_one({'id': u['id'], '$or': [{'notification_test_at': {'$exists': False}}, {'notification_test_at': {'$lt': cutoff}}]}, {'$set': {'notification_test_at': now()}})
    if not result.modified_count: raise HTTPException(429, 'Tunggu satu menit sebelum mengirim uji berikutnya.')
    from notify import notify
    await notify([u['id']], 'Uji notifikasi', 'Pengaturan notifikasi akun Anda telah diuji.', 'akun', '/settings', entity_type='akun', entity_id=u['id'])
    return {'message': 'Uji dijadwalkan sesuai kanal aktif. Lihat status pengiriman di bawah.'}