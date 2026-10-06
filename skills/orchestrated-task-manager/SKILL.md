---
name: orchestrated-task-manager
description: Agent workflow yang menggabungkan state memory, ponytail (minimalis & anti-overengineering), dan no-ai-slop (ringkas & padat).
---

# Operational Workflow

Setiap kali menerima prompt tugas dari pengguna, eksekusi urutan pipeline berikut secara berurutan:

### Step 1: Memory & Context Extraction
1. Periksa status memory yang disuntikkan secara otomatis pada prompt sistem (atau cek `python3 ~/.gemini/config/skills/task-manager/update_state.py --status`).
2. Ekstrak data baru dari prompt pengguna:
   - Goal / tujuan baru.
   - Constraint / batasan teknis baru.
3. Sinkronkan ke memory dengan memanggil script state:
   `python3 ~/.gemini/config/skills/task-manager/update_state.py --goal "<Goal>" --constraint "<Constraint>"`

### Step 2: Synthesis with "Ponytail" Constraint
1. Sebelum membuat rencana kode atau solusi teknis, panggil aturan skill `ponytail:ponytail`:
   - Cari solusi **paling sederhana**, terpendek, dan paling minim dependensi.
   - Singkirkan boilerplate, abstraksi yang belum diperlukan (*YAGNI*), dan arsitektur berlebih (*anti-overengineering*).
2. Rumuskan 1 kalimat keputusan teknis terpilih berdasarkan state memori.

### Step 3: Targeted Execution
- Tulis kode atau terapkan patch hanya pada file yang relevan.
- Hindari membuat wrapper atau utility file tambahan jika fungsi bisa ditaruh langsung secara inline dan bersih.

### Step 4: Output Filtering with "No-AI-Slop"
1. Lewatkan respons akhir melalui prinsip skill `no-ai-slop:no-ai-slop`:
   - Hapus kata-kata klise/pengisi: *delve, tapestry, crucial, certainly, in conclusion, comprehensive*.
   - Hapus sapaan pembuka dan kalimat penutup repetitif.
2. Sajikan output secara langsung:
   - **Context Status:** 1 baris status goal & constraints dari memori.
   - **Ponytail Rationale:** 1 baris alasan mengapa solusi ini adalah yang paling minimal.
   - **Diff / Code Output:** File atau perubahan kode konkret.
