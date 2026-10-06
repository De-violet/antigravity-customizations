#!/usr/bin/env bash
set -euo pipefail

DEST="${HOME}/.gemini/config"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Memasang modul Antigravity ke ${DEST}..."
mkdir -p "${DEST}/plugins" "${DEST}/skills"

cp -r "${SCRIPT_DIR}/plugins/"* "${DEST}/plugins/"
cp -r "${SCRIPT_DIR}/skills/"* "${DEST}/skills/"

echo "==> Berhasil! Modul sudah aktif."
echo "    Jalankan 'agy' untuk langsung menggunakannya."
