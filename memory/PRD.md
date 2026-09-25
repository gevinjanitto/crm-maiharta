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


## Iterasi — 25 Sep 2026: Perbaikan merge & reCAPTCHA + subtask builder
- **Masalah awal:** repo GitHub ter-commit dengan konflik merge Git yang belum diselesaikan di 35 file (backend + frontend). Workspace `/app` hanya berisi template kosong.
- **Solusi:** kode dipulihkan dari commit bersih `19defd6` (cabang ClickUp-Kanban + reCAPTCHA, tanpa konflik) sebagai sumber kebenaran, bukan hasil resolusi heuristik.
- **reCAPTCHA:** backend `auth.py` + `Login.jsx` sudah mendukung reCAPTCHA v2. Env `RECAPTCHA_SITE_KEY`/`RECAPTCHA_SECRET_KEY` (backend) dan `REACT_APP_RECAPTCHA_SITE_KEY` (frontend) diisi. Bila kosong → fallback math captcha.
- **Subtask builder:** komponen `SubtaskInput` baru di `Common.jsx`; `TaskForm` (TaskModal.jsx) & `WorkForm` (WorkComponents.jsx) tidak lagi baca textarea per-baris, kini tambah satu-per-satu ala ClickUp (input + "Add Task" + hapus). Backend menerima `subtasks: list[str]` (terverifikasi).
- **BLOCKER eksternal:** site key yang diberikan user bukan tipe reCAPTCHA v2 (Google: "Invalid key type"). Butuh pasangan key reCAPTCHA v2 "I'm not a robot" Checkbox yang benar, dan domain preview harus didaftarkan di Google console.
- Kredensial test: lihat `memory/test_credentials.md`.

