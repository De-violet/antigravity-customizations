#!/usr/bin/env bash
set -euo pipefail

DEST="${HOME}/.gemini/config"
REPO="De-violet/antigravity-customizations"
BRANCH="main"

echo "==> Memasang modul Antigravity ke ${DEST}..."
mkdir -p "${DEST}/plugins" "${DEST}/skills"

# Deteksi apakah script dijalankan lokal atau dipipe melalui curl/wget | bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-}")" 2>/dev/null && pwd || true)"

if [ -n "$SCRIPT_DIR" ] && [ -d "${SCRIPT_DIR}/plugins" ] && [ -d "${SCRIPT_DIR}/skills" ]; then
  # Dijalankan dari direktori clone lokal
  cp -r "${SCRIPT_DIR}/plugins/"* "${DEST}/plugins/"
  cp -r "${SCRIPT_DIR}/skills/"* "${DEST}/skills/"
else
  # Dijalankan langsung via curl/wget | bash
  TMP_DIR=$(mktemp -d)
  cleanup() {
    rm -rf "$TMP_DIR"
  }
  trap cleanup EXIT

  echo "==> Mengunduh berkas dari GitHub (${REPO})..."
  curl -fsSL "https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz -C "$TMP_DIR"

  cp -r "${TMP_DIR}/antigravity-customizations-${BRANCH}/plugins/"* "${DEST}/plugins/"
  cp -r "${TMP_DIR}/antigravity-customizations-${BRANCH}/skills/"* "${DEST}/skills/"
fi

echo "==> Berhasil! Modul Antigravity sudah aktif."
echo "    Jalankan 'agy' untuk langsung menggunakannya."
