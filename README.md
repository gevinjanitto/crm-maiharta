# CRM Maiharta

Sistem manajemen project MaiHarta — React (Vercel) + FastAPI (Railway) + MongoDB Atlas + Cloudinary.

## Akun awal (seed)
Password semua akun: `MaiHarta!642a8bda` (ubah via env `SEED_PASSWORD` sebelum deploy pertama, atau ganti dari menu Pengaturan setelah login).

| Role          | Username       |
|---------------|----------------|
| Admin         | `admin`        |
| Admin Project | `adminproject` |
| Developer     | `developer`    |
| Accounting    | `accounting`   |
| Client        | `client`       |

## Deploy backend ke Railway
1. New Project → Deploy from GitHub repo → pilih repo ini.
2. Settings → **Root Directory**: `backend`.
3. Variables (lihat `backend/.env.example`):
   - `MONGO_URL` — connection string MongoDB Atlas
   - `DB_NAME` — misal `crm_maiharta`
   - `CORS_ORIGINS` — URL frontend Vercel, dipisah koma (misal `https://crm-maiharta.vercel.app`)
   - `JWT_SECRET` — string acak panjang
   - `SEED_PASSWORD`, `ADMIN_EMAIL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Email notifikasi penugasan: `RESEND_API_KEY` + `MAIL_FROM` (lihat bagian Email di bawah), `APP_URL` = URL Vercel
4. Railway otomatis memakai `backend/railway.json` (start: `uvicorn server:app --host 0.0.0.0 --port $PORT`, healthcheck `/api/health`).
5. Generate Domain → catat URL, misal `https://crm-maiharta-backend.up.railway.app`.

## Deploy frontend ke Vercel
1. Import repo → **Root Directory**: `frontend` (Framework: Create React App).
2. Environment Variable: `REACT_APP_BACKEND_URL` = URL Railway di atas (tanpa `/api`, tanpa slash di akhir).
3. Deploy. `frontend/vercel.json` sudah mengatur SPA rewrite dan `CI=false`.
4. Setelah domain Vercel aktif, tambahkan domain tersebut ke `CORS_ORIGINS` di Railway lalu redeploy backend.

## Email notifikasi penugasan (Resend)
Dipakai saat developer ditugaskan pada task Kanban, subtask, revisi/maintenance, atau tiket.
1. Daftar gratis di https://resend.com (3.000 email/bulan gratis).
2. Domains → Add Domain → tambahkan record DNS yang diminta (SPF/DKIM) di domain Anda, tunggu *Verified*.
   Untuk uji cepat tanpa domain, pakai `MAIL_FROM=CRM Maiharta <onboarding@resend.dev>` (hanya bisa kirim ke email akun Resend Anda sendiri).
3. API Keys → Create API Key → salin ke env `RESEND_API_KEY` di Railway.
4. Set `MAIL_FROM=CRM Maiharta <noreply@domain-anda.com>` dan `APP_URL` (link di isi email).
Alternatif SMTP (mis. Gmail App Password): isi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — dipakai jika `RESEND_API_KEY` kosong. Riwayat pengiriman bisa dicek di `GET /api/notifications` (Admin).

## Catatan
- Sesi login memakai token Bearer (localStorage) + cookie `SameSite=None; Secure`, sehingga aman lintas domain Vercel ↔ Railway.
- Dokumen project disimpan di Cloudinary (`resource_type=raw`, `type=authenticated`) dan diunduh melalui backend dengan pengecekan role.
- Data awal (5 akun, 5 client, 8 project) dibuat otomatis saat backend pertama kali berjalan pada database kosong.
