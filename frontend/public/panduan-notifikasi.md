# Aktivasi notifikasi CRM Maiharta

## Rekomendasi

Email memakai **Resend melalui layanan email terkelola**, WhatsApp memakai **Meta WhatsApp Cloud API resmi**. Tidak memerlukan proses browser/QR WhatsApp tidak resmi. Backend FastAPI mengirim pesan; frontend React hanya menyimpan preferensi.

Setiap akun membuka **Pengaturan → Notifikasi akun**, lalu memilih Dalam aplikasi / Email / WhatsApp. Email dikirim ke email akun yang terdaftar, WhatsApp ke nomor yang disimpan di pengaturan. Menyimpan WhatsApp aktif mencatat persetujuan pengguna. Mengirim pesan `STOP` atau `BERHENTI` ke nomor bisnis juga menonaktifkannya setelah webhook terpasang.

Pesan eksternal memakai template pemberitahuan tetap dan mengarahkan pengguna melihat detail di aplikasi; tidak menyalin komentar bebas atau informasi rahasia ke email/WA. CC tiket hanya berlaku untuk akun aktif yang memiliki akses project dan mengikuti preferensi penerima. Tidak ada pengiriman massal ke alamat arbitrer.

## Email

Integrasi email tidak memerlukan akun Resend atau Resend API key dari pengguna. Alamat pengirim dikelola layanan. Nama pengirim wajib **CRM Maiharta**.

### Backend Railway milik Anda

1. Dependensi `httpx` sudah tercatat di `backend/requirements.txt`; instalasi backend: `pip install -r requirements.txt`.
2. Root directory tetap `backend`, start command yang sudah ada memakai `$PORT`. Jangan mengganti port preview aplikasi.
3. Pada Variables backend, gunakan konfigurasi email server berikut:
   - `EMERGENT_EMAIL_KEY`: key email milik aplikasi yang sudah diprovisikan. Salin secara aman dari konfigurasi backend, **bukan** dari repositori publik. Jangan membuat key acak sendiri.
   - `EMAIL_FROM_NAME=CRM Maiharta`
   - `APP_URL`: URL HTTPS frontend Anda, tanpa slash akhir.
   - `EMAIL_REPLY_TO`: opsional, email yang benar-benar Anda kelola.
4. `RESEND_API_KEY`, `MAIL_FROM`, dan SMTP bukan jalur pengiriman yang digunakan versi ini.
5. Simpan konfigurasi dan jalankan ulang backend agar variabel terbaca. Layanan email terkelola merupakan layanan eksternal; koneksi keluar HTTPS harus diizinkan.
6. Buat/pakai akun dengan email asli milik penerima yang setuju diuji. Aktifkan Email dan Simpan notifikasi, lalu klik **Uji**. Muat ulang riwayat pengiriman.

**Diterima layanan** berarti provider menerima permintaan, bukan bukti email sudah masuk inbox. Periksa inbox/spam penerima. Alamat `.example`, `.test`, `.invalid`, `.localhost` serta domain contoh `example.com`, `example.org`, `example.net` tidak dikirim. Riwayat menampilkan Gagal/Tidak dikirim jika konfigurasi belum tersedia.

## WhatsApp Meta: apakah gratis?

Tidak sepenuhnya gratis. Template notifikasi proaktif dapat dikenai biaya; tarif tergantung kategori, negara penerima, dan kebijakan Meta saat pengiriman. Jangan mengasumsikan notifikasi task selalu gratis. Periksa tarif terbaru di https://business.whatsapp.com/products/platform-pricing dan WhatsApp Manager. Biaya hosting terpisah.

### Aktivasi Meta

1. Siapkan Meta Business Portfolio, aplikasi Meta dengan produk WhatsApp, WABA, dan nomor WhatsApp bisnis.
2. Hubungkan nomor bisnis dan catat **Phone Number ID** (bukan nomor telepon dan bukan WABA ID).
3. Buat System User access token dengan izin `whatsapp_business_messaging` dan akses aset yang sesuai. Token sementara untuk pengujian jangan dipakai sebagai konfigurasi jangka panjang.
4. Buat template notifikasi transaksional di WhatsApp Manager. Ajukan kategori Utility, tanpa variabel:

   `CRM Maiharta memiliki pembaruan untuk akun Anda. Silakan buka aplikasi untuk melihat detailnya.`

   Persetujuan/kategori final ditentukan Meta. Jika tidak disetujui, sesuaikan isi dan nama template konfigurasi sesuai hasil Meta. Jangan mengklaim template sudah disetujui sebelum ada status Approved.
5. Simpan nama API template dan bahasa yang benar-benar disetujui, misalnya `id` untuk bahasa Indonesia jika demikian di akun Meta Anda.
6. Tambahkan pembayaran/billing WABA sesuai persyaratan akun dan tarif kategori yang berlaku.

### Variables backend Railway

```text
META_GRAPH_BASE_URL=https://graph.facebook.com
META_GRAPH_VERSION=<versi API yang didukung dan diuji pada aplikasi Meta Anda>
META_PHONE_NUMBER_ID=<Phone Number ID>
META_ACCESS_TOKEN=<token System User>
META_TEMPLATE_NAME=<nama API template yang disetujui>
META_TEMPLATE_LANGUAGE=<kode bahasa yang disetujui>
META_APP_SECRET=<App Secret aplikasi Meta>
META_WEBHOOK_VERIFY_TOKEN=<string acak panjang untuk verifikasi webhook>
```

Jangan memasukkan placeholder di atas sebagai nilai sebenarnya. Jangan menaruh token/secret pada kode React atau variabel `REACT_APP_*`.

### Webhook Meta

- Callback URL: URL HTTPS backend Anda + `/api/webhooks/whatsapp`.
- Verify token: sama dengan `META_WEBHOOK_VERIFY_TOKEN` backend.
- Subscribe field `messages` pada WABA.
- Server memverifikasi `X-Hub-Signature-256` menggunakan App Secret, mencatat status sent/delivered/read/failed, dan menangani opt-out.
- Aktifkan WhatsApp pada akun uji yang memberi persetujuan, Simpan, lalu Uji. Status Diterima layanan belum sama dengan Sampai. Konfirmasi status callback Meta.

## Frontend Vercel

Tidak perlu memasang SDK Resend atau Meta di React. Root directory tetap `frontend`; dependensi `yarn install`, build `yarn build`. Cukup set `REACT_APP_BACKEND_URL` ke URL backend Anda. Semua secret email/Meta hanya di backend. `CORS_ORIGINS` backend harus mencakup origin frontend HTTPS yang tepat.

## Keterbatasan operasional versi ini

Pengiriman berjalan non-blocking menggunakan proses backend aplikasi dan memiliki riwayat hasil. Belum ada durable queue/retry otomatis lintas restart: jika proses mati sebelum pesan dikirim, pengiriman tersebut dapat hilang. Untuk kebutuhan SLA tinggi, tambahkan durable outbox/worker idempoten dalam fase berikutnya. Preferensi dibaca ulang sebelum pengiriman agar opt-out segera dihormati.

Saat perubahan ini dibuat, kredensial Meta, template Approved, dan kontak uji asli belum diberikan. Pengiriman WhatsApp nyata belum dapat diverifikasi; database lama tidak diakses. Tidak ada pengiriman uji ke nomor WhatsApp pengguna.