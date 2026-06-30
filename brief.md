# Aplikasi DUMAS AKPOL - Panduan Penggunaan & Uji Coba

## 🏛️ Deskripsi Singkat
**DUMAS (Pengaduan Masyarakat) AKPOL** adalah platform layanan aduan terintegrasi yang dirancang khusus untuk melaporkan segala bentuk kerusakan infrastruktur atau fasilitas di lingkungan Akademi Kepolisian. Aplikasi ini menjembatani komunikasi antara Pelapor (Taruna/Staf), Teknisi di lapangan, dan Administrator melalui satu pintu yang transparan dan *real-time*.

## ⚡ Teknologi di Balik Aplikasi
Aplikasi ini dibangun menggunakan arsitektur web modern kelas industri:
- **Frontend (Tampilan):** Menggunakan **Next.js 14** dan **Tailwind CSS**. Menjamin aplikasi berjalan sangat cepat, animasi mulus, dan *Mobile-Responsive* (tampil rapi di layar HP maupun Komputer).
- **Backend & Database:** Didukung oleh **Supabase (PostgreSQL)**, menyediakan basis data relasional yang kokoh dan aman.
- **Real-Time Notification:** Memanfaatkan teknologi *WebSockets* (Supabase Realtime), memungkinkan setiap notifikasi dan perubahan status langsung muncul di layar pengguna seketika tanpa perlu me-*refresh* halaman.
- **Keamanan (Security):** Dilindungi dengan sistem *Row Level Security (RLS)* berlapis tingkat militer yang mengisolasi data masing-masing pihak. Pelapor tidak akan bisa melihat atau mengganggu data milik teknisi, begitupun sebaliknya.

---

## 🔑 Akses Akun Demo (Untuk Testing)

Untuk mencoba simulasi alur laporan dari awal hingga selesai, silakan gunakan 3 akun demo di bawah ini secara bergantian.

> **Password untuk semua akun:** `123456`

### 1. 🔵 PELAPOR (Taruna / Staf)
Gunakan akun ini di Tab **Pelapor** untuk membuat laporan kerusakan baru.
- **NRP (Username):** `akpol1`
- **Apa yang bisa dilakukan?** 
  - Membuat laporan baru (wajib melampirkan foto kondisi).
  - Melacak pergerakan status laporan (dari *Masuk* hingga *Selesai*).
  - Memberikan **Penilaian/Rating (1-5 Bintang)** atas hasil kerja Teknisi.

### 2. ⚫ ADMINISTRATOR (Pusat Kendali)
Gunakan akun ini di Tab **Admin** untuk menyortir dan memverifikasi laporan.
- **NRP (Username):** `admin1`
- **Apa yang bisa dilakukan?** 
  - Melihat *Dashboard Statistik* keseluruhan.
  - Memverifikasi laporan baru dan meneruskannya (Ubah status ke *Diproses*).
  - Menolak (*Reject*) laporan yang palsu atau tidak jelas dengan melampirkan catatan.

### 3. 🟡 TEKNISI (Petugas Lapangan)
Gunakan akun ini di Tab **Teknisi** untuk mengeksekusi perbaikan.
- **NRP (Username):** `teknisi1`
- **Apa yang bisa dilakukan?** 
  - Menerima "Work Order" laporan yang sudah di-*ACC* oleh Admin.
  - Melaporkan progres pengerjaan (Ubah status ke *Ditangani*).
  - **Wajib** memotret dan mengunggah **Foto Sesudah (Hasil Perbaikan)** saat menyelesaikan tugas 100%.

---
*Dibuat khusus untuk digitalisasi Akademi Kepolisian, mewujudkan transparansi dan kecepatan layanan.*
