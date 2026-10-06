# Antigravity CLI Customizations

Kumpulan plugin, skill, dan aturan global (*guardrails*) untuk [Antigravity CLI](https://github.com/google-deepmind/antigravity).

---

## Modul yang Disertakan

### Plugins (`plugins/`)
- **`no-ai-slop`**: Menghilangkan basa-basi pembuka/penutup, klise generik AI, dan memaksa respons langsung ke inti teknis.
- **`ponytail`**: *Lazy senior dev mode* — prinsip YAGNI, anti-overengineering, minim dependensi, dan mengutamakan diff terkecil yang bekerja.
  - Perintah bawaan: `/ponytail`, `/ponytail-audit`, `/ponytail-review`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`.

### Skills (`skills/`)
- **`task-manager`**: Manajemen status dan memori lokal proyek (`update_state.py`) secara persisten per workspace.
- **`orchestrated-task-manager`**: Alur kerja otomatis yang mengintegrasikan `task-manager`, `ponytail`, dan `no-ai-slop`.

---

## Cara Pasang di Komputer Baru

Pastikan Antigravity CLI (`agy`) sudah terpasang di komputer target, lalu jalankan:

### Opsi 1: Satu Baris Perintah (SSH)
```bash
git clone git@github.com:De-violet/antigravity-customizations.git /tmp/agy-mods && \
/tmp/agy-mods/install.sh && \
rm -rf /tmp/agy-mods
```

### Opsi 2: Manual
```bash
# 1. Clone repository
git clone git@github.com:De-violet/antigravity-customizations.git ~/antigravity-customizations

# 2. Masuk dan jalankan installer
cd ~/antigravity-customizations
./install.sh
```

---

## Struktur Direktori Tujuan

Setelah diinstal, file akan disalin ke direktori konfigurasi global Antigravity:
```text
~/.gemini/config/
├── plugins/
│   ├── no-ai-slop/
│   └── ponytail/
└── skills/
    ├── orchestrated-task-manager/
    └── task-manager/
```
Plugin dan skill akan langsung aktif saat perintah `agy` dijalankan tanpa perlu konfigurasi tambahan.
