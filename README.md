# DUMAS AKPOL - Panduan Menjalankan Aplikasi

Dokumen ini berisi panduan bagi Dosen, Penguji, atau Rekan Kerja yang menerima *file* ZIP aplikasi ini untuk menjalankannya di komputer lokal (*localhost*).

## 📌 Prasyarat Sistem
Sebelum menjalankan aplikasi, pastikan komputer Anda sudah terinstal:
1. **Node.js** (Minimal versi 18 atau terbaru). Bisa diunduh di [nodejs.org](https://nodejs.org/).
2. **Git / Terminal** (Bisa menggunakan *Command Prompt* atau *Terminal* bawaan VS Code).

---

## 🚀 Langkah-Langkah Menjalankan Aplikasi

### Langkah 1: Ekstrak ZIP
Ekstrak (Unzip) file yang telah Anda terima ke dalam satu folder (misal: `AkpolComplaintApp`).

### Langkah 2: Buka Folder di Code Editor
Buka folder hasil ekstrak tersebut menggunakan **Visual Studio Code (VS Code)** atau *text editor* lainnya.

### Langkah 3: Install Dependencies
Karena folder `node_modules` tidak disertakan dalam ZIP (untuk menghemat ukuran), Anda harus mengunduhnya terlebih dahulu.
1. Buka terminal di VS Code (Pilih menu **Terminal -> New Terminal**).
2. Ketik perintah berikut dan tekan Enter:
   ```bash
   npm install
   ```
3. Tunggu hingga proses *download* selesai (tergantung kecepatan internet).

### Langkah 4: Pastikan File .env.local Tersedia
Pastikan terdapat file bernama `.env.local` di dalam folder utama. File ini berisi kunci akses ke database Supabase milik pembuat aplikasi. *(Jika file ini tidak ada, Anda harus memintanya kepada pengembang).*

### Langkah 5: Jalankan Server Lokal
Setelah instalasi selesai, ketik perintah berikut di terminal:
```bash
npm run dev
```

### Langkah 6: Buka di Browser
1. Jika terminal sudah menampilkan tulisan `ready - started server on 0.0.0.0:3000`, buka browser Anda (Chrome/Edge/Safari).
2. Ketikkan alamat berikut di baris URL:
   ```text
   http://localhost:3000
   ```
3. Aplikasi **DUMAS AKPOL** siap untuk digunakan!

---

## 🔑 Akun Demo (Testing)
Untuk mencoba fitur aplikasi tanpa perlu repot mendaftar, silakan gunakan kredensial berikut. **Password untuk semua akun adalah:** `123456`

- **Tab Pelapor:** `akpol1` (Untuk membuat laporan & rating)
- **Tab Teknisi:** `teknisi1` (Untuk memproses laporan & upload bukti selesai)
- **Tab Admin:** `admin1` (Untuk verifikasi laporan & cek statistik)
