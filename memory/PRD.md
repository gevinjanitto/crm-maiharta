# CRM Maiharta — Perubahan terarah

## Iterasi 39 — Filter tahun, edit/hapus user, sambutan akun baru (2026-10)
- Semua Project: filter tahun (dari grup tahun mulai project) di sebelah search.
- Manajemen User: edit nama, username, email, nomor WA, role; hapus permanen (AlertDialog) — nonaktif tetap ada. DELETE /api/users/{id} (tolak hapus diri sendiri & Admin terakhir).
- Akun baru dari Admin (Manajemen User & Client baru): must_change_password=True (reset saat login pertama), welcome_pending=True; notifikasi "Selamat datang di CRM Maiharta" in-app + email + WA (username & password awal, link /login; password tidak disimpan di in-app). Popup sambutan (WelcomeDialog) setelah password diganti; POST /api/auth/welcome-seen.
- Privasi: password/URL pribadi dihapus dari tests & public files; .env masuk .gitignore; kredensial n8n hanya di backend/.env.

## Iterasi 38 — Uji notifikasi khusus Admin + hitungan harian (2026-06)
- Tombol Uji notifikasi & status Gmail/WAHA hanya untuk Admin.
- GET /api/account/notifications/daily-stats (Admin): jumlah email & WA accepted sejak 00.00 WITA, semua akun; tampil di popup (email N/500). Testing iteration_6 lulus.

## Iterasi 37 — Teks WA lengkap, logo putih email, Barong pegang ID (2026-06)
- whatsapp_text (email_template.py): judul, pesan, Project/Oleh/Waktu, link; dikirim via send_whatsapp text.
- Email header pakai assets/logo-mark-white.png (aset user putih.png).
- Link panduan/workflow di panel Notifikasi akun dihapus.
- Login: fokus username → tangan Barong pegang kartu ID (assets/barong-id.webp). Preview WA aktif ke n8n+WAHA user, uji accepted. Testing iteration_5 lulus.

## Iterasi 36 — Popup uji notifikasi, email bermerek anti-spam (2026-06)
- Tombol 'Uji notifikasi' di bawah nomor WA membuka dialog (NotificationTestDialog) berisi kirim uji + riwayat pengiriman berwarna.
- email_template.py: email tabel bermerek + teks polos; payload n8n tambah text & unsubscribe_url.
- n8n-gmail-workflow.json v2: Gmail API raw MIME multipart (Profil Gmail → Susun email → Kirim via Gmail API), From 'CRM Maiharta', List-Unsubscribe. User perlu impor ulang.
- WA 404: workflow crm-whatsapp user belum Active di n8n (bukan kode). Testing iteration_4 lulus.

## Iterasi 35 — Barong interaktif di login (2026-06)
- Kelopak mata Barong menutup saat fokus di password (terbuka/mengintip saat password ditampilkan).
- Tangan Barong jempol (assets/barong-thumb.webp, hasil generate) muncul saat verifikasi berhasil: token reCAPTCHA Google atau jawaban CAPTCHA matematika benar. Testing iteration_3 lulus.

## Iterasi 34 — Email anti-spam & panduan Docker Image (2026-06)
- Email: subjek 'CRM Maiharta: <judul notifikasi>', isi berisi nama penerima, judul, pesan, aktor, tombol Lihat di CRM ke link spesifik; footer 'password/kode verifikasi' dihapus (pemicu phishing).
- Panduan: Docker Image Railway = ketik image lalu Enter (bukan klik link hub.docker.com); bagian 'Email masuk folder Spam?'. Testing iteration_2 lulus.

## Iterasi 33 — Klasifikasi Preventive/Support, hapus Resend, panduan WAHA (2026-06)
- Permintaan: tambah Preventive & Support pada klasifikasi maintenance + kategori tiket; hapus semua Resend (email via n8n); cek kenapa email belum masuk; pandu WA via WAHA + n8n + Railway.
- Maintenance kinds: Adaptive, Corrective, Preventive, Support, Change Request (projects.py + WorkComponents.jsx).
- Ticket category: Bug / Problem, Maintenance, Preventive, Support, Change Request, Out of Scope (schemas.py + Tickets.jsx).
- mailer.py hanya n8n (EMAIL_PROVIDER, RESEND_*, MAIL_FROM, EMAIL_REPLY_TO dihapus). notification_delivery: alasan gagal berisi kode HTTP (403 secret, 404 workflow tidak aktif, 502 Gmail/WAHA).
- Panduan panduan-notifikasi.md ditulis ulang: checklist diagnosis, Gmail via n8n, WAHA Railway (Docker image devlikeapro/waha, volume /app/.sessions, dashboard QR), workflow WA, variables.
- Diagnosis: n8n /webhook/crm-email aktif (403 tanpa secret, 422 dengan secret lama → secret cocok). URL yang dikirim user /webhook-test/ → ditolak backend. Aktor tidak menerima notif aksinya sendiri.
- Uji preview: CRM → n8n → Gmail accepted. Testing iteration_1 lulus 100%.
- Backlog: user isi Variables Railway + deploy WAHA; P2 isi email berisi judul notifikasi, log pengiriman admin.


## Iterasi 32 — Email Gmail via n8n (2026-10-05)
- User belum punya domain & Railway Hobby memblokir SMTP → dipilih Gmail via n8n (Gmail API HTTPS).
- mailer.py: EMAIL_PROVIDER=resend|n8n. n8n: POST N8N_EMAIL_WEBHOOK_URL (/webhook/crm-email) header X-CRM-Webhook-Secret = N8N_WAHA_WEBHOOK_SECRET, payload {notification_id,to,subject,html,sender_name}; balasan wajib {ok:true,status:'accepted',notification_id,message_id}.
- Workflow baru frontend/public/n8n-gmail-workflow.json (Webhook→Validasi→If→Gmail v2.1→Konfirmasi→Respond). Panduan bagian 0 (jalur cepat) di panduan-notifikasi.md.
- Resend key user valid (tes delivered@resend.dev 200). Preview .env: EMAIL_ENABLED=true, EMAIL_PROVIDER=resend, MAIL_FROM onboarding@resend.dev (sandbox: hanya ke email pemilik akun Resend).
- n8n user: (URL n8n disimpan hanya di environment backend). Workflow email Active, Gmail OAuth OK. Uji end-to-end CRM preview → n8n → Gmail: accepted (provider n8n_gmail). Backend test lulus.
- Belum: WAHA (WhatsApp); user perlu Save to GitHub lalu isi Variables backend Railway.

## Iterasi 31 — Kanban, harga, akses developer, status tombol (2026-10-05)
- Kanban: "Tambah task" langsung di bawah kartu tiap kolom (bukan rata bawah).
- Semua input nominal Rp memakai MoneyInput (Common.jsx): kosong saat 0, titik ribuan otomatis.
- Developer: 1 task (task/subtask/tiket/fitur/maintenance) = otomatis anggota project (core.sync_task_members, backfill startup). Developer boleh memindahkan semua kartu (status/server/order) di project yang ia akses; edit field lain tetap dibatasi.
- Ringkasan: StatusPicker berupa tombol kartu; Development butuh dokumen Penawaran Harga ATAU Kontrak (backend + UI kunci + tautan unggah).
- TaskDetail tidak tertutup saat klik di luar; hanya tombol close (Escape tetap).
- Maintenance/Revisi: PIC/prioritas/tanggal dibaca dari task Kanban (attach_task_info) + sinkron dua arah. WorkBrowser dipakai menu utama & tab project, dengan filter tahun. Ikon slider & ikon ↵ di pencarian dihapus.
- Backend test iterasi 31 lulus semua.
- Iterasi 31b: StatusPicker menampilkan SEMUA 12 status (grid 4 kolom), bisa lompat maju/mundur. Backend change_status tidak lagi memaksa urutan; tetap: Production/Selesai khusus Admin, Developer hanya status teknis, masuk tahap >= Development dari tahap awal butuh Penawaran/Kontrak, Production butuh revisi selesai.

## Perbaikan jarak Profil dan Keamanan akun — 2026-10-05
- Permintaan: “ni rapikan ya”; pilihan eksplisit: “Tetap dua kolom: Notifikasi di kiri, Profil dan Keamanan berdekatan di kanan; jarak dan ukuran dibuat konsisten”; catatan: “tu jarak profil akun dan keaamanan akun terlalu jauh”.
- Persona/kebutuhan: seluruh pengguna Pengaturan; ruang kosong besar antarbagian kanan harus dihilangkan tanpa mengubah fungsi atau desain lainnya.
- Implementasi hanya CSS App.css: kolom kanan memakai flex vertikal, justify-content:flex-start, align-self:start, height:fit-content dan gap tetap 24px. Panel tidak tumbuh/menyusut mengikuti tinggi Notifikasi dan margin panel direset.
- Arsitektur, formulir, autentikasi, data, dan semua integrasi tetap. Desktop dua kolom; layar kecil tetap stack satu kolom.
- Screenshot main mengukur gap tepat24px dan tidak berubah ketika panel Notifikasi diperpanjang ke1800px. Testing iteration_4 lulus pada1920/1366/768/390/360, tepi sejajar, tanpa overflow, form dapat dijangkau, validasi konfirmasi password tetap bekerja tanpa mengganti password. Tidak ada data uji dibuat.
- P0/P1 tersisa untuk permintaan ini: tidak ada. Tidak menambah cakupan backlog; aktivasi provider dan pengembangan opsional pada catatan sebelumnya tetap terpisah.

---

## Pembaruan terbaru — Pengaturan, login, Resend dan n8n + WAHA (2026-10-05)

### Permintaan asli sesi ini
“hapus fitur import dari clickup, di penganturan fullkan saja jangan setengah gitu. di login coba tambahkan aset aset yg menunjukkan developer dan softwarehose (tapi design tetap simplke dan elegant). di gambar 1 drai mana dapet variabel variabelnya tu dan di resend apa aja yg harus disetting. sama untuk notif wanya ubah pakai n8n + WAHAdan cara settingnya lengkap di railway ataupun jika ada seting setting lainnya”

Pilihan eksplisit pengguna:
- Lebarkan isi Pengaturan memenuhi area halaman, bukan hanya setengah layar (bukan permintaan fitur pengaturan baru).
- Pertahankan Barong, tambahkan elemen developer/software house sederhana dan elegan.
- Belum ada Resend/n8n/WAHA; siapkan integrasi dan panduan dari awal, termasuk sumber variabel, Railway, dan pengujian. Tidak melakukan provisioning atau pengiriman nyata.

### Persona, kebutuhan, dan keputusan
- Seluruh akun mengelola preferensi sendiri; admin menyiapkan layanan/server. Persetujuan WhatsApp, izin project, CC yang berhak, email terdaftar dan isolasi riwayat tetap berlaku.
- React/FastAPI/MongoDB dipertahankan; tidak mengubah autentikasi, kredensial akun, protected env, database produksi atau task hasil impor lama.
- Resend API langsung via httpx (bukan managed email relay). Kunci milik akun Resend pengguna; endpoint resmi, From domain verified, optional Reply-To, fixed server template, idempotency header per notification.
- Backend → authenticated n8n production webhook → WAHA sendText. Hanya konfirmasi ok/accepted + ID pesan WAHA + notification_id cocok dihitung accepted. HTTP 2xx generik tidak cukup. Timeout dilabeli unknown/perlu diperiksa, bukan sukses.
- Kanal server fail-closed: EMAIL_ENABLED=false dan WHATSAPP_ENABLED=false sampai layanan, keys dan opt-in siap. Tidak menggunakan placeholder send success atau mock provider dalam kode aplikasi.
- Rahasia hanya di backend/service credentials. N8N_WAHA_WEBHOOK_SECRET berbeda dari WAHA API key; n8n/WAHA tidak berjalan di pod CRM. Tidak ada perubahan port preview.

### Implementasi
1. Hapus halaman/link/route/API/parser/CSV/panduan impor ClickUp dan startup index creation. Data task/arsip yang dahulu diimpor tidak dihapus. Label asal historis masih dipertahankan pada task lama.
2. Pengaturan full-width: notifikasi di kiri; profil + keamanan dalam kolom kanan tanpa gap tinggi, stack satu kolom pada layar kecil.
3. Barong dan interaksi gaze tetap; developer terminal, git branch dan code mark dekoratif ringan, responsif dan reduced-motion. Eyebrow software house. Tidak mengubah login logic.
4. Status konfigurasi Resend dan n8n+WAHA serta alasan belum aktif, simpan preferensi, uji menunggu hasil dan memuat ulang riwayat. Flag/in-app dan batas satu uji per menit dipertahankan.
5. Halaman `/settings/notifications-guide`: markdown terformat, tabel asal variabel, DNS/SPF/DKIM/DMARC Resend, API key, Railway n8n/PostgreSQL, WAHA port/volume/QR/security, credential webhook, test URL vs production, cara uji dan diagnosis. Unduh panduan + workflow n8n tanpa secret/inactive. README dan backend/.env.example diselaraskan.
6. Workflow menggunakan node standar n8n, validasi E.164, HTTP error branch, provider response checks dan correlation, retry otomatis off. Code node memakai $input.first() untuk runOnceForAllItems.

### Pengujian dan disposisi temuan
- `test_reports/iteration_3.json`: 14/14 regression API/contract tests lulus; browser memeriksa 1920/1366/768/390/360 tanpa overflow, assets login, guide/back/download, prefs, ClickUp removed, Kanban sync smoke.
- Kontrak Resend/n8n diuji dengan transport tiruan hanya pada test suite, bukan pengiriman sesungguhnya. Tambahan evaluasi JavaScript offline memverifikasi Code nodes pada payload valid/422, WAHA accepted, 500/missing ID/timeout/blank ID ->502.
- Final screenshot aktual `/app/notification-guide-final.jpg` dan `/app/settings-final.jpg` menunjukkan panduan dan Pengaturan; navigasi balik lulus. Kendala automasi sebelumnya karena BrandIntro/inert timing, bukan regression login.
- Field WhatsApp diberi testid kebab-case eksplisit `notification-whatsapp-number` (komponen Field sebenarnya sudah memberi testid bawaan).
- Catatan testing tentang seed tidak mereset password akun existing **bukan bug untuk cakupan ini**: seed memang khusus database kosong. Mereset password existing saat environment berubah justru mengubah autentikasi tanpa permintaan dan menimpa password pengguna. Perilaku dipertahankan; tidak ada rotasi credential.
- Fixture tiket TEST_ITER30_SYNC dibersihkan tanpa menghapus seed/riwayat pengguna lain.

### Batasan dan backlog terprioritas
- P0 kode/UI: tidak ada masalah inti tersisa pada cakupan ini.
- P1 aktivasi milik pengguna: buat akun/domain Resend, pasang n8n/WAHA/Postgres/volume, isi secret server, verifikasi DNS, scan QR dan uji penerima sendiri. Pengiriman email/WhatsApp nyata belum aktif/belum terverifikasi.
- P1 opsional: durable outbox + deduplikasi/retry tahan restart. Alur sekarang non-blocking in-process, belum menjamin exactly-once.
- P2 opsional: inbound STOP/BERHENTI melalui n8n, callback sent/delivered/read WAHA dan delivery/bounce Resend. Versi ini hanya accepted dan opt-out melalui Pengaturan; tidak mengklaim callback Meta lama masih aktif.
- WAHA tidak resmi; risiko nomor dibatasi dan sesi putus dijelaskan. Tidak menjanjikan biaya nol, delivered/read, atau SLA yang belum diimplementasikan.

---

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
- Tidak mengubah login/hash/password/session code. Konfigurasi rahasia preview baru digunakan oleh mekanisme seed asli.

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
