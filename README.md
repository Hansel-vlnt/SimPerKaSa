# SIM-PERKASA

**Sistem Informasi Manajemen Perkebunan Kelapa Sawit**

Aplikasi ini adalah Sistem Informasi untuk memantau data operasional dan finansial perkebunan kelapa sawit. Terdiri dari *Frontend* berbasis React (Vite) dan *Backend* berbasis FastAPI (Python) yang terhubung ke MongoDB Atlas.

---

## Persyaratan Sistem (Prerequisites)

Sebelum menjalankan aplikasi ini, pastikan komputer Anda sudah terinstal perangkat lunak berikut:

1. **Node.js** (Minimal versi 18 atau terbaru) - Untuk menjalankan Frontend.
2. **Python** (Minimal versi 3.9 atau terbaru) - Untuk menjalankan Backend.

---

## Cara Instalasi & Menjalankan Aplikasi

Aplikasi ini memiliki 2 bagian yang harus dijalankan secara bersamaan di 2 Terminal terpisah: **Backend** (API) dan **Frontend** (Antarmuka Web).

### 1. Setup Backend (Terminal 1)

Backend menggunakan Python FastAPI dan membutuhkan beberapa *library* khusus.

1. Buka Terminal dan arahkan ke folder Backend:

   ```bash
   cd BE
   ```
2. Buat *Virtual Environment* (agar *library* Python tidak tercampur dengan proyek lain):

   ```bash
   python -m venv venv
   ```
3. Aktifkan *Virtual Environment*:

   - **Windows (PowerShell):** `.\venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`
4. Instal semua *library* yang dibutuhkan:

   ```bash
   pip install -r requirements.txt
   ```
5. **(SANGAT PENTING)** Buat file bernama `.env` di dalam folder `BE`, lalu minta kode *MongoDB Connection String* kepada Pemilik Proyek. Isi file `.env` dengan format:

   ```env
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster...
   ```
6. Jalankan Server API:

   ```bash
   uvicorn main:app --reload
   ```

   *Jika berhasil, terminal akan memunculkan teks "Application startup complete". Server API berjalan di `http://127.0.0.1:8000`.*

### 2. Setup Frontend (Terminal 2)

Frontend menggunakan React dan Vite.

1. Buka Terminal baru dan arahkan ke folder Frontend:

   ```bash
   cd FE
   ```
2. Instal semua dependensi Node.js:

   ```bash
   npm install
   ```
3. Jalankan Server Web:

   ```bash
   npm run dev
   ```
   *Jika berhasil, buka browser Anda dan akses `http://localhost:5173`.*
