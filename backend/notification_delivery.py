"""Preferences are re-read at delivery time so opt-outs take effect immediately."""
import html
import logging
import os
from core import db, uid, now
from mailer import send_email, email_configured
from whatsapp import send_whatsapp, whatsapp_configured

log = logging.getLogger(__name__)


def example_email(address):
    domain = address.rsplit('@', 1)[-1].lower()
    return domain.endswith(('.example', '.test', '.invalid', '.localhost')) or any(domain == d or domain.endswith('.' + d) for d in ['example.com', 'example.org', 'example.net'])


def email_html():
    url = os.environ.get('APP_URL', '').rstrip('/')
    button = f'<p><a href="{html.escape(url)}/notifications">Buka CRM Maiharta</a></p>' if url else ''
    return '<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1f2733"><h3>Pembaruan CRM Maiharta</h3><p>Ada pembaruan terkait akun atau pekerjaan Anda. Buka CRM Maiharta untuk melihat detailnya.</p>' + button + '<p style="font-size:12px;color:#667085">CRM Maiharta tidak meminta password atau kode verifikasi melalui email ini.</p></div>'


async def deliver_notifications(notifications):
    for notification in notifications:
        for channel in ['email', 'whatsapp']:
            user = await db.users.find_one({'id': notification['user_id'], 'active': True}, {'_id': 0})
            if not user or not user.get('notification_preferences', {}).get(channel, channel == 'email'): continue
            delivery = {'id': uid(), 'notification_id': notification['id'], 'user_id': user['id'], 'channel': channel, 'status': 'skipped', 'created_at': now(), 'reason': ''}
            configured = email_configured() if channel == 'email' else whatsapp_configured()
            recipient = user.get('email') if channel == 'email' else user.get('whatsapp_number')
            if not configured: delivery['reason'] = 'Layanan belum dikonfigurasi.'
            elif not recipient: delivery['reason'] = 'Kontak akun belum terdaftar.'
            elif channel == 'email' and example_email(recipient):
                delivery['reason'] = 'Alamat contoh tidak dikirim.'
            elif channel == 'whatsapp' and not user.get('whatsapp_opt_in_at'):
                delivery['reason'] = 'Persetujuan WhatsApp belum tercatat.'
            else:
                try:
                    provider_id = await send_email(recipient, 'Pembaruan CRM Maiharta', email_html()) if channel == 'email' else await send_whatsapp(recipient)
                    if not provider_id: raise ValueError('Provider tidak mengembalikan ID pesan.')
                    delivery.update(status='accepted', provider_id=provider_id)
                except Exception:
                    log.warning('Pengiriman %s gagal untuk notification_id=%s', channel, notification['id'])
                    delivery.update(status='failed', reason='Layanan menolak atau belum dapat menerima pesan. Periksa konfigurasi server.')
            await db.notification_deliveries.insert_one(delivery.copy())