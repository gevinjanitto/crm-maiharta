# Migrasi ClickUp dan backup MongoDB — CRM Maiharta

## Status pekerjaan

Impor CSV tersedia pada **Pengaturan → Impor ClickUp**, untuk Admin dan Admin Project. Belum ada akses ke workspace ClickUp atau database lama Anda. Tidak ada migrasi atau backup database lama yang dijalankan oleh perubahan ini.

## 1. Backup sebelum migrasi

1. Pastikan `MONGO_URL` dan `DB_NAME` menunjuk database **sumber yang benar**. Jangan menebak nama database. Gunakan kredensial hanya di terminal/server pribadi, bukan di frontend atau Git.
2. Instal **MongoDB Database Tools** (termasuk `mongodump` dan `mongorestore`) dari https://www.mongodb.com/try/download/database-tools. Ini berbeda dari paket Python `pymongo`.
3. Hentikan sementara penulisan aplikasi ketika melakukan dump database standalone. Dump sambil data berubah tidak menjamin snapshot konsisten. Untuk Atlas, gunakan snapshot backup Atlas jika tersedia sesuai konfigurasi cluster.
4. Dari root repositori, ekspor variabel secara aman lalu jalankan:

```bash
# Gunakan shell pribadi. Jangan menyimpan connection string di history/chat.
read -rsp 'MongoDB URI sumber: ' MONGO_URL; export MONGO_URL; printf '\n'
read -rp 'Nama database sumber: ' DB_NAME; export DB_NAME
bash scripts/backup_mongodb.sh /lokasi-aman/backup-maiharta
```

Script hanya membaca database; tidak menghapus koleksi. Hasilnya berupa arsip BSON terkompresi (termasuk metadata/index), checksum, dan salinan `backend/uploads` bila ada. Jangan menaruh backup di `frontend/public` atau melakukan commit backup ke Git.

5. Simpan salinan terenkripsi di tempat lain. Backup berisi data pribadi, hash password, dan mungkin data sesi. Batasi aksesnya.
6. Data file **Cloudinary tidak berada di MongoDB**. Backup/aset Cloudinary perlu disalin terpisah. Database hanya memuat rujukannya. File lokal ada di `backend/uploads` dan sudah disertakan oleh script bila direktori tersedia.

### Uji restore ke database BARU (bukan menimpa sumber)

```bash
sha256sum -c /lokasi-aman/backup-maiharta/SHA256SUMS
# Isi RESTORE_MONGO_URL dan RESTORE_DB secara aman terlebih dahulu.
# RESTORE_DB wajib berbeda dari DB_NAME sumber.
mongorestore --uri="$RESTORE_MONGO_URL" \
  --archive=/lokasi-aman/backup-maiharta/database.archive.gz --gzip \
  --nsFrom="$DB_NAME.*" --nsTo="$RESTORE_DB.*"
```

Bandingkan jumlah dokumen per koleksi, periksa indeks, lalu jalankan aplikasi pada database hasil restore. Jangan memakai `--drop` pada database sumber. Hapus sesi login pada database hasil restore yang akan digunakan sebagai lingkungan baru agar sesi lama tidak ikut aktif.

## 2. Ekspor ClickUp

Ekspor task List/Space menggunakan fasilitas export CSV ClickUp sesuai hak akses paket/workspace Anda. Sertakan **Task ID**, Task Name, Description/Task Content, Status, Assignee, Priority, Start Date, Due Date, Tags, Time Estimate, Parent ID, Space Name, Folder Name, dan List Name bila tersedia. Pilih UTF-8 dan sertakan subtask. Simpan ekspor asli.

Dokumentasi ekspor: https://help.clickup.com/hc/en-us/articles/6310552469143-Export-List-and-Table-views

## 3. Impor

1. Buat/pilih project tujuan. Tambahkan Developer yang diperlukan pada anggota project. Admin dan Admin Project aktif juga dapat dipilih sebagai PIC.
2. Buka **Pengaturan → Impor ClickUp**. Pilih project tujuan dan CSV (maksimal 2 MB / 2.000 baris per file).
3. Klik **Baca CSV**, periksa pemetaan kolom. Task ID dan nama task wajib. Satu kolom tidak boleh dipetakan ke dua field.
4. Petakan status ClickUp ke status Kanban yang sudah ada. Petakan semua PIC ke akun internal yang benar. Pilihan **Tanpa PIC** adalah keputusan eksplisit, bukan pembuatan akun otomatis.
5. Pilih format tanggal DMY/MDY dan satuan Time Estimate. Nilai angka default ditafsirkan sebagai milidetik; pilih jam/menit jika ekspor Anda memakai satuan lain. Format seperti `1h 30m` juga didukung.
6. Klik **Pratinjau impor**. Perbaiki semua error; pratinjau tidak menulis task. Jika kolom status/PIC diganti, jalankan pratinjau lagi agar nilai sumber diperbarui.
7. Setelah backup siap dan hasil benar, centang konfirmasi lalu **Konfirmasi & impor**.

### Yang dibawa

- Task: judul, deskripsi teks, status, PIC jamak, prioritas, tanggal mulai/deadline, tags, estimasi waktu.
- Space → Folder → List dibuat di dalam project tujuan ketika kolomnya tersedia; nama kosong menggunakan kelompok Impor ClickUp.
- Subtask satu tingkat menjadi checklist subtask pada task induk, termasuk PIC pertama dan status selesai. CSV asli tetap disimpan untuk referensi metadata yang tidak didukung checklist.
- Baris CSV asli disimpan pada koleksi `clickup_import_records` untuk penelusuran admin/database; tidak dibuka kepada Client melalui API task.
- **Task ID + project tujuan** menjadi identitas impor. Mengunggah file yang sama kembali tidak menggandakan atau menimpa task. Task yang sudah ada (termasuk subtasks-nya) dilewati. Impor bukan sinkronisasi dua arah.

### Batasan yang penting

CSV tidak menjamin seluruh workspace terbawa. Komentar, file attachment sebenarnya, ClickUp Docs, whiteboard, automasi, dependency, permission, custom field aktif, time log, dan riwayat perubahan **belum dimigrasikan sebagai fitur aktif**. Kolom yang tersedia tetap tersimpan di arsip CSV internal. Subtask bertingkat harus diratakan; parent wajib ada di file yang sama. Subtask memiliki model lebih sederhana daripada task utama sehingga tanggal, deskripsi, status detail, dan PIC tambahan subtask hanya tersimpan pada arsip asal.

Untuk migrasi lengkap, fase lanjutan perlu contoh ekspor/akses API ClickUp, inventaris data, unduhan attachment ke penyimpanan sendiri, pemetaan user/permission, impor bertahap, dan rekonsiliasi jumlah. Jangan menghapus workspace ClickUp sebelum seluruh hasil diperiksa. Panduan ini tidak mengklaim semua data ClickUp sudah terbawa.