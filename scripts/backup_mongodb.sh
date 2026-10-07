#!/usr/bin/env bash
# Read-only backup. Never invoked automatically by the application.
set -euo pipefail
umask 077
: "${MONGO_URL:?Set MONGO_URL sumber secara aman terlebih dahulu}"
: "${DB_NAME:?Set DB_NAME sumber terlebih dahulu}"
if [[ $# -ne 1 ]]; then printf 'Pemakaian: bash scripts/backup_mongodb.sh DIREKTORI_BARU\n' >&2; exit 2; fi
command -v mongodump >/dev/null || { printf 'Instal MongoDB Database Tools terlebih dahulu.\n' >&2; exit 2; }
target="$1"
if [[ -e "$target" ]]; then printf 'Direktori tujuan sudah ada; backup lama tidak akan ditimpa.\n' >&2; exit 2; fi
mkdir -p -- "$target"
target="$(cd "$target" && pwd)"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mongodump --uri="$MONGO_URL" --db="$DB_NAME" --archive="$target/database.archive.gz" --gzip
if [[ -d "$root/backend/uploads" ]]; then
  tar -czf "$target/uploads.tar.gz" -C "$root/backend" uploads
fi
sha256sum "$target/database.archive.gz" > "$target/SHA256SUMS"
if [[ -f "$target/uploads.tar.gz" ]]; then sha256sum "$target/uploads.tar.gz" >> "$target/SHA256SUMS"; fi
printf 'Backup selesai. Verifikasi checksum dan uji restore ke database baru: %s\n' "$target"