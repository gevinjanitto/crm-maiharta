import os, asyncio, logging, smtplib, requests
from email.message import EmailMessage
from core import db, uid, now

log = logging.getLogger('mailer')

def send_email(to, subject, html):
    sender = os.environ.get('MAIL_FROM', 'CRM Maiharta <onboarding@resend.dev>')
    if os.environ.get('RESEND_API_KEY'):
        r = requests.post('https://api.resend.com/emails', headers={'Authorization': f"Bearer {os.environ['RESEND_API_KEY']}"}, json={'from': sender, 'to': [to], 'subject': subject, 'html': html}, timeout=20)
        r.raise_for_status()
        return True
    if os.environ.get('SMTP_HOST'):
        msg = EmailMessage(); msg['From'] = sender; msg['To'] = to; msg['Subject'] = subject; msg.set_content(html, subtype='html')
        with smtplib.SMTP(os.environ['SMTP_HOST'], int(os.environ.get('SMTP_PORT', '587'))) as s:
            s.starttls(); s.login(os.environ['SMTP_USER'], os.environ['SMTP_PASSWORD']); s.send_message(msg)
        return True
    log.info('Email dilewati (RESEND_API_KEY/SMTP belum diset): %s -> %s', subject, to)
    return False

async def notify_assignment(user_id, kind, title, project_id, due_date=None):
    u = await db.users.find_one({'id': user_id}, {'_id': 0, 'email': 1, 'name': 1})
    if not u: return
    p = await db.projects.find_one({'id': project_id}, {'_id': 0, 'name': 1})
    subject = f"[CRM Maiharta] Penugasan {kind}: {title}"
    link = os.environ.get('APP_URL', '')
    html = f"<p>Halo {u['name']},</p><p>Anda ditugaskan pada <b>{kind}</b>: <b>{title}</b><br/>Project: <b>{p['name'] if p else '-'}</b></p>"
    if due_date: html += f"<p>Target selesai: {due_date}</p>"
    if link: html += f'<p><a href="{link}">Buka CRM Maiharta</a></p>'
    html += '<p>— CRM Maiharta</p>'
    note = {'id': uid(), 'user_id': user_id, 'email': u['email'], 'subject': subject, 'kind': kind, 'title': title, 'project_id': project_id, 'status': 'pending', 'created_at': now()}
    await db.notifications.insert_one(note.copy())
    async def run():
        try:
            sent = await asyncio.to_thread(send_email, u['email'], subject, html)
            status = 'sent' if sent else 'skipped'
        except Exception as e:
            log.warning('Email gagal: %s', e); status = 'failed'
        await db.notifications.update_one({'id': note['id']}, {'$set': {'status': status}})
    asyncio.create_task(run())
