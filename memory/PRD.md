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
