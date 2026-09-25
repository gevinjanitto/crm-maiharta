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
4. Railway otomatis memakai `backend/railway.json` (start: `uvicorn server:app --host 0.0.0.0 --port $PORT`, healthcheck `/api/health`).
5. Generate Domain → catat URL, misal `https://crm-maiharta-backend.up.railway.app`.

## Deploy frontend ke Vercel
1. Import repo → **Root Directory**: `frontend` (Framework: Create React App).
2. Environment Variable: `REACT_APP_BACKEND_URL` = URL Railway di atas (tanpa `/api`, tanpa slash di akhir).
3. Deploy. `frontend/vercel.json` sudah mengatur SPA rewrite dan `CI=false`.
4. Setelah domain Vercel aktif, tambahkan domain tersebut ke `CORS_ORIGINS` di Railway lalu redeploy backend.

## Catatan
- Sesi login memakai token Bearer (localStorage) + cookie `SameSite=None; Secure`, sehingga aman lintas domain Vercel ↔ Railway.
- Dokumen project disimpan di Cloudinary (`resource_type=raw`, `type=authenticated`) dan diunduh melalui backend dengan pengecekan role.
- Data awal (5 akun, 5 client, 8 project) dibuat otomatis saat backend pertama kali berjalan pada database kosong.
