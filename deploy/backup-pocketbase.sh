#!/usr/bin/env bash
# Tägliches App-Level-Backup der PocketBase-SQLite-DB.
# Nutzt SQLites Online-Backup-API (.backup) — konsistent auch bei laufendem
# Schreibzugriff, anders als ein plumpes cp der .db-Datei.
#
# Läuft als dedizierter Timer (siehe pocketbase-backup.{service,timer}).
# Ergänzt (ersetzt nicht) die Hetzner-Snapshots: zweite, unabhängige Kopie.
set -euo pipefail

PB_DATA="/opt/pocketbase/pb_data/data.db"
BACKUP_DIR="/opt/pocketbase/backups"
RETENTION_DAYS=14
STAMP="$(date +%F)"
OUT="${BACKUP_DIR}/data-${STAMP}.db"

mkdir -p "$BACKUP_DIR"

# Konsistente Kopie ziehen.
sqlite3 "$PB_DATA" ".backup '${OUT}'"
gzip -f "$OUT"

# Alte Backups aufräumen.
find "$BACKUP_DIR" -name 'data-*.db.gz' -mtime "+${RETENTION_DAYS}" -delete

# --- Off-box-Kopie (empfohlen — gegen Total-Verlust des VPS/Hetzner-Kontos) ---
# Eine der beiden Zeilen einkommentieren und konfigurieren:
#
# rclone-Remote (z. B. S3/Backblaze/Storagebox):
#   rclone copy "${OUT}.gz" remote:kalima-backups/ --quiet
#
# scp auf einen zweiten Host:
#   scp -q "${OUT}.gz" backup@zweiter-host:/pfad/kalima-backups/

echo "Backup fertig: ${OUT}.gz"
