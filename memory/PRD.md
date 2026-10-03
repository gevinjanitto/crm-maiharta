# CRM Maiharta — Perubahan terarah

## Pembaruan terbaru — Sinkronisasi Kanban dan tiket (2026-10-03)

### Permintaan asli sesi ini
“https://github.com/gevinjanitto/crm-maiharta clone project ini, tolong jikat tiket di kanban dipindah dikerjakan status tiket juga berubah jadi dikerjakan”

Pilihan eksplisit: **Sinkronkan status tiket untuk semua perpindahan kolom Kanban**.

### Cakupan dan keputusan arsitektur
- Clone branch main sumber dfe78f5 ke /app; React/FastAPI/MongoDB dan desain lama dipertahankan. MONGO_URL, DB_NAME dan REACT_APP_BACKEND_URL tidak diubah. Tidak mengakses database/website produksi pengguna.
- Persona: Admin/Admin Project mengelola kartu; Developer mengerjakan kartu yang diizinkan; Client memantau tiket miliknya. Hak akses asli dipertahankan.
- Akar bug: sync_source hanya menerima Diterima→Dikerjakan dan sebagian status→Selesai; mengabaikan Baru serta perpindahan kembali.
- Helper backend ticket_status_sync.py menjadi pemetaan terpusat berdasarkan jenis kolom, bukan nama kustom: active (termasuk Dikerjakan/Testing/Revisi) → Dikerjakan, done → Selesai, kembali todo dari pekerjaan aktif/selesai → Diterima. Tiket yang belum dikerjakan di todo mempertahankan tahap triase/persetujuannya.
- Tiket Ditutup/Ditolak tidak dibuka kembali melalui Kanban; Selesai boleh kembali dikerjakan. Change Request/Out of Scope tetap membutuhkan estimasi positif dan persetujuan. Tidak menambah status Testing/Revisi baru ke alur tiket.
- Tidak mengubah login/hash/password/session code. Konfigurasi rahasia preview baru digunakan oleh mekanisme seed asli; kredensial terkini ada di memory/test_credentials.md.

### Implementasi sesi ini
1. Sinkronisasi tiket baru, maju, mundur, pengiriman ulang status, bulk, kolom kustom, perubahan jenis/nama kolom, penghapusan kolom dengan pemindahan, dan automasi status_changed.
2. Validasi sebelum perubahan task/bulk/kolom; query tiket dibatasi project; riwayat status tiket dan audit mencatat pelaku tanpa duplikasi untuk status yang tidak berubah.
3. Ringkasan/badge tiket project dimuat ulang hanya setelah penyimpanan Kanban berhasil. Tiket global/project dan maintenance memakai dokumen tiket yang sama.

### Verifikasi sesi ini
- /api/health OK, compile Python berhasil, frontend compiled successfully.
- iteration_1: 5/5 kelompok regression API lulus; tests di backend/tests/test_iter29_ticket_status_sync_kanban.py.
- Kendala CAPTCHA awal merupakan timing pengujian; login UI berhasil dua kali tanpa perubahan kode auth.
- iteration_2: drag desktop Dikerjakan→Selesai→Dikerjakan→Belum Mulai, reload persistence, tiket project/global Diterima, summary HTTP 200, drag tablet dan perubahan status mobile lulus. Tidak ada bug fungsional tersisa untuk cakupan ini.
- Toolbar filter mobile lama cukup padat tetapi tetap dapat digunakan; tidak didesain ulang karena permintaan hanya sinkronisasi.
- Tidak ada mock API untuk perbaikan ini. Integrasi eksternal asli (email/WhatsApp/unggah) di luar cakupan dan tidak diuji/diaktifkan ulang.

### Backlog dan langkah berikutnya
- P0: tidak ada pekerjaan tersisa untuk sinkronisasi yang diminta.
- P1 opsional: tombol batalkan perpindahan terakhir dengan validasi yang sama.
- P2 opsional: batas pekerjaan aktif per kolom; penanda tiket yang lama tidak bergerak.
- Riwayat kebutuhan sebelum sesi ini di bawah adalah konteks repositori, bukan tambahan cakupan pengguna saat ini.

---

## Permintaan asli

https://github.com/gevinjanitto/crm-maiharta saya ada project clone saja. Lakukan perubahan di bagian kanban, biar task bisa dilimpahkan ke admin dan admin project juga gak cuma developer. dan untuk sekarang kalo dah developer ditambahkan ke 1 task di project itu pas buat project baru gak bisa nambahin orang lain buat bisa ditambahkan semua user dengan role admi, admin project, dan developer. Buat yang bisa buat tiket cuma client. dan jika tiket sudah dibuat client lgsg masuk ke maintenace di menu utama dan maintenace yg ada diproject. di maintenance project tambahkan juga tombol tambahnya. di dokumen juga biar bisa menambahkan link googledoc, googlesheet, dan liink lainnya. sertakan juga nama dokumennya dan baru link atau filenya. Notifikasi buat biar bisa ke email dan wa (rekomendasikan pakai apa yg cocock jika deploy di railway dan vercel + cara intallnya disana). di setiap akun juga ada pengaturan notifikasi masuk kemana aja (bisa on off). dan memungkinkan gak kalo data di clickup dimigrasi ke aplikasi ini biar semuanya kebawa ke app ini dan bagaimana caranya termasuk membackup data dummy saat ini di mongodb.

## Pilihan eksplisit pengguna

- Repositori publik, branch default (main, snapshot sumber dfe78f5).
- Pertahankan bagian lain dan desain lama: “jangan ubah lainnya”.
- Hanya Client membuat tiket; Admin/Admin Project menambahkan pekerjaan maintenance, bukan tiket client. Tombol harus tersedia pada tab maintenance project.
- Belum ada kredensial Meta atau kontak uji asli: bangun pengaturan, koneksi layanan, serta panduan; WhatsApp tetap menunggu aktivasi.
- Belum ada contoh ClickUp/database lama: bangun impor CSV dengan pratinjau/pemetaan dan panduan backup. Jangan menyentuh database lama.

## Persona & persyaratan tetap

- Admin: manajemen workspace/user dan penugasan; semua proyek.
- Admin Project: manajemen proyek, task/maintenance/dokumen dan impor; sesuai aturan asli.
- Developer: proyek tempat ia terdaftar dan pekerjaan sesuai aturan penugasan asli.
- Client: proyek milik client-nya, pembuatan tiket dan persetujuan sesuai alur asli.
- Accounting: akses keuangan asli; tidak mendapat izin baru membuat tiket/maintenance/impor.
- Tiap akun mengendalikan kanal notifikasi sendiri; tidak ada parameter user_id untuk mengganti preferensi orang lain.

## Keputusan arsitektur

- Clone basis React/FastAPI/MongoDB pengguna ke /app, mempertahankan protected env dan desain. Tidak membuat ulang aplikasi atau landing page.
- Gunakan otorisasi terpusat core.authorize/project_for/validate_assignee; role berasal dari current_user yang membaca database, bukan request body.
- /team menampilkan Admin, Admin Project, Developer aktif tanpa filter kapasitas/proyek lain. Developer PIC harus anggota proyek; manager PIC boleh ditugaskan tanpa membership eksplisit karena sudah memiliki akses proyek.
- Tiket ditampilkan sebagai **live view** pada maintenance (id ticket:<id>), bukan menyalin dokumen maintenance/task. Ini mencegah task duplikat dan status yang tertinggal. Pengelolaan tiket tetap lewat TicketDetail/triase asli.
- Dokumen mendukung multipart name + tepat satu file/url. HTTP/HTTPS saja tanpa credentials; link tidak di-fetch server. File menyimpan original filename terpisah dari nama tampilan. Storage asli Cloudinary/local tetap dipertahankan.
- Notifikasi memakai preferensi tersimpan per-user, template eksternal tetap, penerima dari data akun. Resend terkelola dengan guardrail, httpx async, serta Meta approved-template sender/webhook HMAC. CC hanya akun terdaftar yang berhak mengakses project. No arbitrary email relay.
- Kanal dibaca ulang saat pengiriman. Log membedakan accepted/sent/delivered/read/failed/skipped. Email contoh IANA disaring. WhatsApp butuh consent dan konfigurasi lengkap; tidak ada mock sender.
- Impor CSV sepenuhnya offline menggunakan stdlib csv/dateutil, sesi 24 jam milik pengunggah, pemetaan eksplisit, pratinjau tanpa menulis task, hash+konfirmasi sebelum commit, atomic lease mencegah concurrent commit. UUID stabil dari project+Task ID membuat replay tidak duplikat. Data lama tidak ditimpa.
- CSV asli disimpan terpisah di clickup_import_records untuk provenance; tidak diekspos pada pembacaan task Client.
- Runtime dependency lock digenerasi dengan script sumber dari lingkungan bersih, menambahkan httpx tanpa membawa library internal tak terpakai ke requirements.

## Implementasi — 2026-10-03

1. PIC Kanban/task/subtask dan anggota project menerima ketiga role internal; membership dapat dipakai lintas proyek. Label/picker mencantumkan role. Sinkronisasi PIC task asal tiket/maintenance/fitur/revisi.
2. API dan UI membatasi pembuatan tiket untuk Client; client scope tetap ditegakkan.
3. Tiket baru/yang sudah ada langsung terlihat dalam maintenance global/proyek dengan badge status tiket dan pembuka triase. Penghitungan dashboard ikut mencakup tiket aktif.
4. Tombol Tambah maintenance pada project tersedia untuk manager sebelum maupun setelah production; pekerjaan manual masuk Kanban dan daftar utama.
5. Form dokumen: nama dahulu, pilih File/Link, kategori dan visibilitas; file bernama khusus dapat diunduh byte-identik dengan nama file asli. Link Docs/Sheets/lainnya dapat dibuka.
6. Pengaturan Dalam aplikasi / Email / WhatsApp per akun, nomor WhatsApp ternormalisasi, consent, uji terbatas per menit, riwayat pengiriman, dan panduan aktivasi yang bisa diunduh.
7. Impor ClickUp di /imports/clickup (tautan Pengaturan): CSV 2 MB/2.000 baris, mapping kolom/status/PIC, DMY/MDY, satuan estimasi, preview+validasi, duplicate skip, project hierarchy, subtask satu tingkat, serta provenance data asal.
8. Panduan publik unduh: /panduan-notifikasi.md dan /panduan-migrasi-backup.md; contoh /clickup-example.csv. Script backup read-only scripts/backup_mongodb.sh tidak dijalankan terhadap database lama.

## Verifikasi — 2026-10-03

- Build produksi frontend berhasil; compile Python/lint perubahan berhasil; clean dependency lock pip check berhasil.
- Testing agent iteration_1: 17/17 API lulus. Laporan dialog/logout ternyata false positive karena klik ketika intro/inert/overlay masih aktif, bukan masalah aplikasi.
- Pemeriksaan browser nyata: Admin Project menyimpan maintenance pra-production dengan PIC Admin, menyimpan link Sheets bernama, mengimpor CSV dari mobile sampai sukses, logout lalu login Client, tombol tiket global/proyek Client terlihat.
- Testing agent iteration_2: 10/10 gap tests lulus, termasuk role assignment allow/deny, reusable memberships, source sync, download bytes/nama, ownership, preferensi/opt-out, importer lease/replay. Report tanpa isu tersisa.
- Pesan email uji ke alamat provider delivered@resend.dev mendapat HTTP 202 Accepted. Ini bukan verifikasi inbox penerima asli.
- Screenshot desktop 1920×800 dan mobile 390×844, maintenance/settings/import/dialog/pratinjau: overflow kosong. Artefak utama /root/.emergent/automation_output/20261003_022240 dan 20261003_023357.
- Tidak mengakses database lama pengguna, tidak mengirim WhatsApp nyata, tidak mengimpor workspace ClickUp asli.
- Pemeriksaan terakhir /root/.emergent/automation_output/20261003_024146: Admin/Admin Project/Developer dapat dipilih bersamaan; dropdown role desktop/mobile bersih. Daftar Kanban mobile yang awalnya terpotong diberi susunan kolom responsif tanpa menyembunyikan isinya; tampilan desktop tetap. Semua pemeriksaan overflow terakhir kosong.
- Pengaturan email diuji klik-save-reload pada mobile dan berhasil persist; preferensi semula dikembalikan. Filter domain IANA example.org/com/net ditambahkan agar data contoh tidak menerima pengiriman eksternal.
- Data hasil pengujian yang diberi prefix TEST_ITER26/TEST_DOC_LINK/UI_TEST_MAINT_ITER26/UI_VERIFY/TEST CSV dibersihkan hanya dari MongoDB preview lokal. Akun dan data contoh bisnis seed dipertahankan.

## Batasan & backlog prioritas

### P0 — Tidak ada blocker untuk cakupan yang disepakati
- Aktivasi WhatsApp nyata membutuhkan kredensial Meta, nomor bisnis, template Approved, billing, callback publik dan nomor uji yang menyetujui pesan. Belum disediakan.
- Uji inbox email milik pengguna menunggu kontak uji nyata.

### P1 — Migrasi data nyata
- Terima contoh ekspor ClickUp; validasi mapping pengguna/status dan format tanggal aktual sebelum impor penuh.
- Dapatkan detail database sumber dan izin eksplisit; jalankan backup lalu uji restore ke database terpisah. Tidak ada backup sumber yang telah dilakukan.
- CSV bukan migrasi lengkap: komentar, attachment binary, Docs, automasi, dependencies, custom fields aktif, time logs dan riwayat perlu importer/API terpisah. Subtask bertingkat perlu pemetaan lanjutan.

### P2 — Keandalan tambahan
- Durable outbox/worker idempoten untuk pengiriman yang tahan restart dan retry; saat ini memakai proses non-blocking yang sama dengan backend.
- Status pengiriman email melalui webhook provider jika tersedia; saat ini accepted bukan delivered.
- Riwayat impor/rollback terpilih dan rekonsiliasi migrasi lengkap.

## Langkah berikutnya

Pengguna dapat mencoba alur baru pada preview dengan akun seed; referensi kredensial terdapat di memory/test_credentials.md. Prioritaskan contoh CSV dan backup sumber sebelum migrasi nyata, lalu aktivasi WhatsApp jika siap.
