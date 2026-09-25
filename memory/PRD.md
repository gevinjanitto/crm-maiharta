<<<<<<< HEAD
# CRM Maiharta — PRD / Work Log

## Problem Statement
User's repo (github.com/gevinjanitto/crm-maiharta) failed to build on Railway:
`ERROR: Invalid requirement: '<<<<<<< HEAD' (from line 2 of requirements.txt)`.

## Root Cause
The latest commit `63e7822` ("revisiii bro") was a botched Git merge (of `55f5c63` and
`0641a06`) that committed **unresolved conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`)
into 46 files — including `backend/requirements.txt`, which broke the Railway/nixpacks
`pip install`. The `SEED_PASSWORD`/`SMTP_PASSWORD`/`RECAPTCHA_SITE_KEY` messages in the log
were only non-fatal nixpacks warnings, not the failure.

## Fix (2026-06)
- Restored all conflicted files to the last clean commit `55f5c63` ("compiles clean / deploy ready").
- Manually resolved one leftover marker in `frontend/.env.example`.
- Copied the clean project into `/app`, preserving pod `.env` values (MONGO_URL, DB_NAME,
  REACT_APP_BACKEND_URL) and adding required app keys (JWT_SECRET, SEED_*, RECAPTCHA_*).
- Verified: 0 conflict markers, backend `/api/health` = ok, frontend login page renders.

## Stack
- Backend: FastAPI + Motor/MongoDB. Entrypoint `server.py` (`uvicorn server:app`). Routers:
  auth, projects, administration, tickets, kanban, finance, audit. Deploy via `railway.json`
  (NIXPACKS) + `Procfile`, healthcheck `/api/health`.
- Frontend: React (CRACO), CRM workspace UI. Deploy via Vercel (`vercel.json` SPA rewrite).

## Notes / Backlog
- reCAPTCHA site key must be registered for the deployed domain (Railway/Vercel URL).
- Document uploads use Cloudinary (env keys required, else 503) — not mocked, awaiting creds.
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
# CRM Maiharta — PRD

## Problem statement (asli)
Project dari https://github.com/gevinjanitto/crm-maiharta. Permintaan:
1. Gambar barong di halaman login diperbesar agar proporsional (bagian hitam sudah di-full-kan).
2. Hapus menu "Kanban" dari menu utama (Kanban ada di dalam project).
3. Semua fitur/modul (Fitur, Tiket, Revisi, Maintenance) otomatis masuk ke Kanban project — tinggal geser-geser.
4. Tulisan lebih besar & jelas (pilihan user: sedikit lebih besar).
5. Tiru design & fitur https://app.clickup.com/ terutama bagian Kanban: drag&drop kartu/kolom, custom status, prioritas, assignee, due date, tag, subtask, komentar, List & Calendar view, Dashboard, Time tracking.

## Arsitektur
- Frontend: React (CRA + craco), CSS kustom (`App.css`, `modern.css`, `kanban.css`), shadcn ui, lucide-react, sonner.
- Backend: FastAPI modular (`server.py`, `auth.py`, `projects.py`, `kanban.py`, `tickets.py`, `finance.py`, `administration.py`, `seed.py`), MongoDB via motor.
- Auth: JWT + cookie, CAPTCHA aritmatika. Role: Admin, Admin Project, Developer, Accounting, Client.
- Catatan: repo asal berisi merge-conflict markers yang tidak terselesaikan; semua sudah diresolve ke sisi HEAD (versi terbaru).

## User personas
- Admin / Admin Project (manager): kelola project, kolom status, task penuh, bulk action.
- Developer: geser task yang ditugaskan padanya, ubah status/server, subtask, timer, komentar, lampiran.
- Client: lihat Kanban project miliknya, komentar.
- Accounting: keuangan (tidak berubah).

## Yang sudah diimplementasikan (Jun 2026)
### Backend (`kanban.py`)
- Custom status/kolom per project (`project.task_statuses`): GET/POST/PATCH/DELETE `/api/projects/{pid}/statuses`, reorder `/statuses/reorder`. Status punya `kind` (todo/active/done) untuk sinkronisasi ke modul sumber.
- Task: field baru `tags`, `start_date`, `estimate_hours`, `order`, `time_entries`; PATCH mendukung `order` (drag antar/di dalam kolom) & clear tanggal.
- Komentar task: `/tasks/{tid}/comments` (GET/POST/DELETE).
- Time tracking: `/tasks/{tid}/timer` (start/stop toggle), `/tasks/{tid}/time` (manual), DELETE entry.
- Bulk action: `POST /tasks/bulk` (status/PIC/prioritas/hapus).
- Dashboard: `GET /projects/{pid}/tasks/stats`.
- Auto-add ke Kanban: Fitur (create/update/delete), Tiket (saat dibuat; Ditolak → hapus task; Ditutup → selesai), Revisi & Maintenance (sudah ada). Sinkron dua arah berdasarkan `kind` status.
- Backfill saat startup: fitur/tiket/revisi/maintenance lama tanpa task otomatis dibuatkan task.
### Frontend
- Menu utama "Kanban" dihapus; `/kanban` redirect ke `/projects`.
- Kanban ClickUp-style di tab project: Board (DnD kartu + reorder kolom, quick add, menu kolom rename/warna/jenis/hapus, tambah status), List (grup per status, inline edit, multi-select + bulk bar), Kalender (drag task ke tanggal), Dashboard (KPI, per status/prioritas/sumber, beban kerja tim).
- Task detail drawer: judul & deskripsi inline, properti (status, PIC, prioritas, server, mulai, target, estimasi, waktu, tag), subtask + progress, lampiran, time tracking (timer live + manual), komentar.
- Font global diperbesar ~30% (`App.css`, `modern.css`), sidebar 264px.
- Barong login diperbesar (height 112%, tanpa max-height).

## Backlog / prioritas
- P1: Gantt/Timeline view berbasis start_date–due_date; multiple assignee; notifikasi @mention di komentar.
- P1: Filter "hanya task saya" & simpan filter per user.
- P2: Custom field, template task, recurring task, automasi (ClickUp Automations).
- P2: Export CSV Kanban, arsip task.

## Kredensial test
Lihat `/app/memory/test_credentials.md`.
<<<<<<< HEAD


## Iterasi — 25 Sep 2026: Perbaikan merge & reCAPTCHA + subtask builder
- **Masalah awal:** repo GitHub ter-commit dengan konflik merge Git yang belum diselesaikan di 35 file (backend + frontend). Workspace `/app` hanya berisi template kosong.
- **Solusi:** kode dipulihkan dari commit bersih `19defd6` (cabang ClickUp-Kanban + reCAPTCHA, tanpa konflik) sebagai sumber kebenaran, bukan hasil resolusi heuristik.
- **reCAPTCHA:** backend `auth.py` + `Login.jsx` sudah mendukung reCAPTCHA v2. Env `RECAPTCHA_SITE_KEY`/`RECAPTCHA_SECRET_KEY` (backend) dan `REACT_APP_RECAPTCHA_SITE_KEY` (frontend) diisi. Bila kosong → fallback math captcha.
- **Subtask builder:** komponen `SubtaskInput` baru di `Common.jsx`; `TaskForm` (TaskModal.jsx) & `WorkForm` (WorkComponents.jsx) tidak lagi baca textarea per-baris, kini tambah satu-per-satu ala ClickUp (input + "Add Task" + hapus). Backend menerima `subtasks: list[str]` (terverifikasi).
- **BLOCKER eksternal:** site key yang diberikan user bukan tipe reCAPTCHA v2 (Google: "Invalid key type"). Butuh pasangan key reCAPTCHA v2 "I'm not a robot" Checkbox yang benar, dan domain preview harus didaftarkan di Google console.
- Kredensial test: lihat `memory/test_credentials.md`.



## Iterasi — 25 Sep 2026: Ekspor laporan .xlsx rapi + animasi
- **Masalah:** ekspor laporan sebelumnya CSV → semua data menumpuk di satu kolom (locale koma vs titik-koma).
- **Solusi:** endpoint baru `GET /api/reports/projects.xlsx` (openpyxl) menghasilkan Excel rapi — tiap kolom terpisah (Kode, Project, Client, Status, Progress %, Deadline; untuk role finance + Nilai/Biaya Dev/Biaya Server/Profit), header berwarna, judul, format mata uang `"Rp"#,##0`, baris **Total** dgn formula SUM, freeze header, lebar kolom otomatis. Endpoint CSV lama tetap ada (dipakai test regresi).
- **Frontend:** tombol Ekspor di `Projects.jsx` & `Finance.jsx` kini unduh `.xlsx`. Komponen baru `ExportButton` (state loading + micro-interaction framer-motion) dan `CountUp` (angka finance menghitung naik). Animasi masuk bertahap (stagger) pada kartu ringkasan finance dan baris tabel project/finance.
- **Verifikasi:** file .xlsx dibuka & divalidasi (kolom terpisah, format, total SUM benar). Frontend compile OK. Screenshot halaman ber-animasi tidak bisa diambil otomatis karena gerbang reCAPTCHA + quirk harness; tidak memengaruhi user asli.
- Dependency baru: `openpyxl==3.1.5`.

=======
=======
# CRM Maiharta — PRD & Handoff

## Permintaan asli
"Buatkan sesuai dokumen Sistem Manajemen Project Maiharta.pdf yg saya berikan. buat dengan design dashboard modern dan kekekinian dengan aksen warna biru, dan tambahkan juga animasi biar keren. Saya juga ada lampirkan logo di LOGO-blue-04.png Nama aplikasi CRM maiharta. di footer tambahkan Design dan develop by MaiHarta, MaiHartanya lgsg ke link ke www.maiharta.com. Di login buat seperti di login (2).jpg cum,a fontnya menyesuaikan dengan dashboard dan warna biru sertakan dengan captcha dan setiap rolenya harus login dengan username dan password. model 3d di login ganti dengan barong.png. sesuaikan agar enak diliat dan buat barongnya bisa mengikuti arah gerakan mouse ya. pokoknya buat yang keren"

Pilihan pengguna: bahasa Indonesia, akun awal tiap role disiapkan; email Admin pemilik giselleharuka@gmail.com. Spesifikasi PDF 12 halaman telah diekstrak dan diperiksa visual. Aset logo dan Barong asli digunakan dari lampiran. File Barong sebenarnya WebP transparan, dipangkas margin transparannya tanpa memotong isi.

## Persona dan kebutuhan tetap
- Admin: manajemen user/role, seluruh project dan finansial, keputusan status final.
- Admin Project: project, client, fitur, timeline, dokumen, penugasan, triase tiket. Akses parsial finansial: nilai project saja, bukan biaya/profit.
- Developer: project ditugaskan, progress fitur, status teknis, deployment dev; tiket yang ditugaskan sesudah triase.
- Accounting: project dan keuangan read-only; dokumen komersial terpilih.
- Client: project milik organisasinya, dokumen yang dibagikan, buat/lihat tiket sendiri; tanpa biaya, profit, catatan internal.
- Workflow 11 tahap sesuai PDF, bukan status tambahan yang disarankan design agent.
- Empat dokumen wajib sebelum Development; final production/selesai hanya Admin.
- Revisi in-scope vs out-of-scope/change request; di luar scope wajib estimasi dan persetujuan.
- Maintenance hanya setelah production; tanggal dibuat, deadline, PIC, tanggal selesai.
- Tiket wajib triase, CR wajib estimasi dan persetujuan sebelum pengerjaan.

## Arsitektur
- Frontend React 19 (JS/JSX, mengikuti starter), React Router, Shadcn primitives, Recharts, Framer Motion, Plus Jakarta Sans; dark default dan light toggle; desain responsif.
- Backend FastAPI, Pydantic input extra=forbid, MongoDB via Motor menggunakan MONGO_URL existing, JWT HS256 + sesi tersimpan, password bcrypt, CAPTCHA matematika sekali pakai, rate-limit login.
- Auth memakai HTTPOnly Secure SameSite=Lax cookie; bearer disediakan untuk API. Role selalu dibaca dari DB setiap request; revoked sessions invalidated.
- RBAC terpusat core.authorize dan project_scope/project_for untuk object access. Field keuangan dan internal diproyeksikan server-side. Tidak ada multi-tenant framework tambahan.
- Object storage terkelola: private upload/download proxy via backend dengan pengecekan role/project, MIME/extension/10MB cap, UUID path, soft delete.
- Koleksi: users, clients, projects (costs embedded), project_features, project_documents, project_status_logs, revisions, maintenances, deployments, tickets, ticket_comments, sessions, captchas, audit_logs, counters, login_attempts.
- API /api/auth/*, /users, /team, /clients, /projects, /projects/:id/{features,costs,documents,status,history,deployments}, /projects/:id/work/{revisions,maintenances}, /work/:kind, /tickets, /tickets/:id/comments, /dashboard, /reports/projects.csv.
- Tidak ada API mock. Contoh awal: 8 project, 5 client, 5 akun, 4 tiket, revisi dan maintenance; data tersimpan dan dapat diedit. Penyimpanan file benar-benar terintegrasi.

<<<<<<< HEAD
## Implementasi — 25 September 2026 (deploy-ready Vercel + Railway + Cloudinary)
- Backend: storage.py diganti ke Cloudinary (raw/authenticated, signed URL), CORS dari env `CORS_ORIGINS` (koma), `/api/health`, cookie SameSite=None + Bearer token; `railway.json`, `Procfile`, `.python-version`, requirements bersih (tanpa emergentintegrations); upload tanpa kredensial Cloudinary → 503 dengan pesan Indonesia.
- Frontend: token disimpan localStorage + interceptor Authorization; `vercel.json` (SPA rewrite, CI=false); logo diganti mark MaiHarta (`/assets/logo-mark.webp`, favicon); footer login dinaikkan ke dalam panel ("© 2026 CRM Maiharta" kiri, "Design dan develop by MaiHarta" kanan), Footer bawah login dihapus; tema light-only modern (`modern.css`), toggle tema dihapus.
- README.md berisi langkah deploy Railway/Vercel dan daftar akun; `.env.example` di backend & frontend; `.gitignore` kini mengabaikan `.env`.
- Testing agent iterasi 2: semua flow (login 5 role, Bearer/me/logout, CORS, dashboard, navigasi, footer/logo) PASS.

=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
## Implementasi — 25 September 2026
- Login ber-CAPTCHA, reveal password, remember session, Barong mouse-tracking parallax, logo asli, footer brand; page title/favicon.
- Dashboard scoped role dengan KPI, finansial, distribusi status, aktivitas, deadline; sumber data API/database.
- Client create/edit/delete (delete hanya tanpa relasi), project create/edit/draft-delete, assignments, pencarian, filter, pagination, CSV.
- Detail project ringkasan, workflow, history, fitur create/progress/delete, timeline berdasarkan fitur, dokumen upload/download/delete, biaya/profit, deployment tracking, revisi, maintenance.
- Tiket create, triage, kategori/prioritas, assignment, estimasi dan approval, status transitions, public/internal comments.
- Manajemen user create/role change/activation; password change pengguna dan admin reset API; navigasi role-gated plus backend enforcement.
- ChartFrame memberikan initialDimension untuk menghindari warning negative chart sizing.
- Berkas CSS dan komponen JSX telah diformat Prettier, mengatasi catatan maintainability dari pengujian. Build terakhir compiled successfully tanpa warning.
- Seluruh fixture TEST_ yang dibuat pengujian (project/client/tiket/user terkait) dibersihkan tanpa mengubah 8 project dan 5 akun awal.
- Verifikasi akhir browser: Admin berhasil login, 8 project tampil, grafik lengkap, nol peringatan dimensi Recharts, navigasi Keuangan dan toggle light/dark berhasil. Kolom tim menampilkan jumlah developer sebenarnya, bukan inisial tetap.
- Build production berhasil. Testing agent: 20/20 backend regression tests passed, frontend auth/navigation/role isolation/responsive 390/768/1920 pass; minor chart warning ditindaklanjuti.
- Test suite `/app/backend/tests/test_api_regression.py`; laporan `/app/test_reports/iteration_1.json`; akun awal `/app/memory/test_credentials.md`.

## Batasan dan backlog prioritas
### P0
- Tidak ada kegagalan inti yang ditemukan dalam pengujian saat ini.
- Pengguna mengganti password awal masing-masing sebelum penggunaan dengan data nyata.
### P1
- Penyuntingan detail fitur/timeline yang sudah dibuat (saat ini bisa tambah, progress, dan hapus; metadata belum dapat diedit).
- Admin reset password melalui UI (endpoint tersedia); pengaturan buka/tutup penerimaan tiket per project.
- Migrasi frontend ke TypeScript untuk menyelaraskan bagian teknologi SRS; starter saat ini JS/JSX.
- Penguatan CAPTCHA untuk penggunaan publik berisiko tinggi, pagination server-side untuk dataset >2.000, pengelolaan audit trail admin.
### P2
- Notifikasi tenggat melalui email/WhatsApp jika integrasi dipilih pengguna; belum diminta sebagai modul wajib PDF.
- Laporan periode lebih rinci, invoice bila modul finansial diperluas, approval dokumen bertingkat.

## Catatan lanjutan
- URL, secret, database berasal dari env; jangan menimpa MONGO_URL/REACT_APP_BACKEND_URL.
- Tidak ada integrasi pembayaran, email otomatis, atau AI yang diklaim berjalan.
- Link footer www.maiharta.com sesuai instruksi; situs eksternal merespons 520 saat diperiksa, bukan error CRM.
- Jalankan suite dengan REACT_APP_BACKEND_URL env, gunakan akun disposable untuk mutasi role/password.
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
