"""Preferences are re-read at delivery time so opt-outs take effect immediately."""
import logging
import httpx
from core import db, uid, now
from mailer import send_email, email_configuration_error
from email_template import email_subject, email_html, email_text, whatsapp_text
from whatsapp import send_whatsapp, whatsapp_configuration_error

log = logging.getLogger(__name__)


def example_email(address):
    domain = address.rsplit('@', 1)[-1].lower()
    return domain.endswith(('.example', '.test', '.invalid', '.localhost')) or any(domain == d or domain.endswith('.' + d) for d in ['example.com', 'example.org', 'example.net'])


def http_reason(code, channel):
    target = 'Gmail' if channel == 'email' else 'WAHA'
    if code in (401, 403):
        return f'n8n menolak secret (HTTP {code}). Samakan N8N_WAHA_WEBHOOK_SECRET dengan credential Header Auth di n8n.'
    if code == 404:
        return 'Webhook n8n tidak ditemukan (HTTP 404). Pastikan workflow Active/Published dan URL memakai /webhook/.'
    if code == 422:
        return 'n8n menolak isi pesan (HTTP 422). Periksa node Validasi payload di n8n.'
    return f'n8n gagal meneruskan ke {target} (HTTP {code}). Buka n8n → Executions untuk detail.'


async def project_title(project_id):
    if not project_id: return ''
    project = await db.projects.find_one({'id': project_id}, {'_id': 0, 'name': 1})
    return project['name'] if project else ''


async def deliver_notifications(notifications):
    for notification in notifications:
        project_name = await project_title(notification.get('project_id'))
        for channel in ['email', 'whatsapp']:
            user = await db.users.find_one({'id': notification['user_id'], 'active': True}, {'_id': 0})
            if not user or not user.get('notification_preferences', {}).get(channel, channel == 'email'): continue
            delivery = {'id': uid(), 'notification_id': notification['id'], 'user_id': user['id'], 'channel': channel, 'provider': 'n8n_gmail' if channel == 'email' else 'n8n_waha', 'status': 'skipped', 'created_at': now(), 'reason': ''}
            problem = email_configuration_error() if channel == 'email' else whatsapp_configuration_error()
            recipient = user.get('email') if channel == 'email' else user.get('whatsapp_number')
            if problem: delivery['reason'] = problem
            elif not recipient: delivery['reason'] = 'Kontak akun belum terdaftar.'
            elif channel == 'email' and example_email(recipient):
                delivery['reason'] = 'Alamat contoh tidak dikirim.'
            elif channel == 'whatsapp' and not user.get('whatsapp_opt_in_at'):
                delivery['reason'] = 'Persetujuan WhatsApp belum tercatat.'
            else:
                try:
                    provider_id = await send_email(recipient, email_subject(notification), email_html(notification, user, project_name), notification['id'], email_text(notification, user, project_name)) if channel == 'email' else await send_whatsapp(recipient, notification['id'], user['id'], notification.get('project_id', ''), whatsapp_text(notification, user, project_name))
                    if not provider_id: raise ValueError('Provider tidak mengembalikan ID pesan.')
                    delivery.update(status='accepted', provider_id=provider_id)
                except httpx.TimeoutException:
                    delivery.update(status='unknown', reason='Layanan belum memberi jawaban. Periksa log sebelum mengirim ulang agar tidak ganda.')
                except httpx.HTTPStatusError as error:
                    code = error.response.status_code
                    log.warning('Pengiriman %s gagal HTTP %s untuk notification_id=%s', channel, code, notification['id'])
                    delivery.update(status='failed', reason=http_reason(code, channel))
                except ValueError as error:
                    log.warning('Pengiriman %s ditolak untuk notification_id=%s: %s', channel, notification['id'], error)
                    delivery.update(status='failed', reason=str(error))
                except Exception as error:
                    log.warning('Pengiriman %s gagal untuk notification_id=%s: %s', channel, notification['id'], type(error).__name__)
                    delivery.update(status='failed', reason='Tidak dapat menghubungi n8n. Periksa URL webhook dan status service n8n di Railway.')
            await db.notification_deliveries.insert_one(delivery.copy())