# Antigravity CLI Customizations

Kumpulan plugin, skill, dan aturan global (*guardrails*) untuk Antigravity CLI.

---

## Modul yang Disertakan

### Plugins (`plugins/`)
- **`no-ai-slop`**: Menghilangkan basa-basi pembuka/penutup, klise generik AI, dan memaksa respons langsung ke inti teknis.
- **`ponytail`**: *Lazy senior dev mode* — prinsip YAGNI, anti-overengineering, minim dependensi, dan mengutamakan diff terkecil yang bekerja.
  - Perintah: `/ponytail`, `/ponytail-audit`, `/ponytail-review`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`.

### Skills (`skills/`)
- **`task-manager`**: Manajemen status dan memori lokal proyek (`update_state.py`) secara persisten per workspace.
- **`orchestrated-task-manager`**: Alur kerja otomatis yang mengintegrasikan `task-manager`, `ponytail`, dan `no-ai-slop`.

---

## Cara Pasang di Komputer Baru (1-Liner)

Jalankan perintah ini di terminal komputer mana saja (tidak butuh git clone atau SSH key):

```bash
curl -fsSL https://raw.githubusercontent.com/De-violet/antigravity-customizations/main/install.sh | bash
```

### Opsi Alternatif (Git Clone)

```bash
git clone https://github.com/De-violet/antigravity-customizations.git ~/antigravity-customizations
cd ~/antigravity-customizations
./install.sh
```

---

## Lokasi Instalasi

File otomatis disalin ke direktori konfigurasi global Antigravity:
```text
~/.gemini/config/
├── plugins/
│   ├── no-ai-slop/
│   └── ponytail/
└── skills/
    ├── orchestrated-task-manager/
    └── task-manager/
```
Modul langsung aktif saat perintah `agy` dijalankan.
