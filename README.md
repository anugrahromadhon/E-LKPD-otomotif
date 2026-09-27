# Aplikasi Web Fullstack e-LKPD Interaktif: Barisan dan Deret Aritmatika
## Konteks Kejuruan Otomotif: Servis Berkala & Catatan Riwayat Kendaraan (Pendekatan PMRI)

Aplikasi Web Fullstack **e-LKPD Interaktif** untuk pembelajaran Matematika SMK Kelas XI berbasis pendekatan **Pendidikan Matematika Realistik Indonesia (PMRI)**. Dilengkapi dengan arsitektur multi-step untuk siswa, backend REST API, database SQLite berkecepatan tinggi, portal khusus guru (`/admin`), dan fitur ekspor rekapitulasi nilai ke Excel (`.xlsx`).

---

### 🌟 Fitur Utama & Modul Sistem

#### 1. MODUL SISWA (Multi-step Flow):
- **Langkah 1 (Cover & Identitas):**
  - Formulir input identitas: Nama Lengkap, Kelas / Jurusan, No. Presensi / Absen, dan Sekolah / Kelompok.
  - Tombol **"Mulai Pengerjaan e-LKPD"** divalidasi secara real-time dan **hanya aktif jika seluruh field wajib terisi**.
  - Dilengkapi petunjuk teknis penggunaan dan capaian pembelajaran.
- **Langkah 2 s/d 8 (Lembar Kerja Bertahap):**
  - Navigasi wizard terpandu dengan tombol *Sebelumnya*, *Selanjutnya*, dan *Quick Jump Dot Indicators*.
  - **Header Sticky:** Menampilkan nomor langkah aktif, judul aktivitas, progress bar persentase, dan **Stopwatch Timer Pengerjaan Real-time**.
  - **Langkah 2 (Ayo Mengamati):** Konteks bengkel otomotif, foto bengkel resmi, video servis berkala, simulasi Odometer digital interaktif (interval +10.000 KM), dan soal esai pengamatan awal.
  - **Langkah 3 (Aktivitas 1):** Membaca kartu foto asli *Service Record* Toyota Avanza dengan *lightbox zoom*, *switcher* form TMO, isian KM, checklist oli, dan pilihan ganda kelengkapan.
  - **Langkah 4 (Aktivitas 2):** Menemukan pola perubahan jarak tempuh dan beda ($b = 10.000\text{ KM}$) melalui tabel servis berkala.
  - **Langkah 5 (Aktivitas 3):** Menemukan rumus suku ke-$n$ ($U_n = a + (n-1)b$), fitur **Drag-and-Drop** pencocokan simbol, dan perhitungan servis ke-20 ($U_{20} = 246.125\text{ KM}$).
  - **Langkah 6 (Aktivitas 4):** Menghitung jumlah akumulasi KM servis 1 s.d. 5 ($380.625\text{ KM}$) dan refleksi keterbatasan penjumlahan manual.
  - **Langkah 7 (Aktivitas 5):** Menemukan rumus deret aritmatika ($S_n$) metode Gauss berpasangan, fitur **Drag-and-Drop ke-2**, dan perhitungan servis ke-10 ($S_{10} = 1.011.250\text{ KM}$).
  - **Langkah 8 (Aktivitas 6):** Kasus kontekstual kendaraan baru ($a=30.000, b=10.000, U_{15}=170.000\text{ KM}, S_{15}=1.500.000\text{ KM}$) dan esai refleksi mandiri.
- **Langkah 9 (Step Akhir - Kumpul & Ringkasan):**
  - Menampilkan ringkasan identitas siswa, **durasi total waktu pengerjaan**, dan tabel status kelengkapan 6 aktivitas.
  - Tombol **"Kirim Jawaban ke Guru"**: Mengirim seluruh payload data ke database backend server melalui REST API.
  - Menampilkan sertifikat penilaian interaktif (*Animated Conic Score Ring*), predikat teknisi, dan opsi cetak lembar kerja / simpan PDF.

#### 2. BACKEND & DATABASE:
- **Runtime:** Node.js v24 + Express framework.
- **Database:** SQLite melalui `better-sqlite3` yang disimpan lokal di `data/elkpd.sqlite` (menggunakan mode WAL untuk performa tinggi).
- **Skema Data:**
  - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  - `nama` (TEXT)
  - `kelas` (TEXT)
  - `no_absen` (TEXT)
  - `sekolah` (TEXT)
  - `timestamp` (TEXT)
  - `durasi` (TEXT, e.g. "14 menit 20 detik")
  - `durasi_detik` (INTEGER)
  - `jawaban` (TEXT JSON)
  - `total_skor` (REAL, skala 0–100)
  - `predikat` (TEXT)
  - `section_scores` (TEXT JSON)

#### 3. MODUL ADMIN GURU (`/admin`):
- **Autentikasi Aman:** Dilindungi PIN / Password khusus Guru (default: `admin123`).
- **Dashboard Ringkasan Cepat:**
  - 👥 Total Siswa Mengumpulkan
  - 📈 Rata-rata Nilai Kelas
  - 🏆 Nilai Tertinggi
  - 🎯 Persentase Kelulusan Berdasarkan KKM (Nilai $\ge 75$)
- **Pencarian & Penyaringan Data:**
  - Filter dropdown berdasarkan Kelas (Semua Kelas, XI TKR 1, XI TKR 2, dsb.).
  - Kotak pencarian instan berdasarkan Nama Siswa atau No. Absen.
- **Detail Pekerjaan Siswa:**
  - Modal inspeksi detail jawaban per siswa (menampilkan jawaban isian, selisih KM, rumus, hingga catatan esai refleksi siswa).
  - Opsi hapus data pengumpulan jika siswa diberi kesempatan remedial / pengerjaan ulang.
- **Fitur "Export to Excel (.xlsx)":**
  - Mengunduh rekapitulasi data seluruh siswa atau berdasarkan filter kelas menjadi file spreadsheet Microsoft Excel (`.xlsx`) siap pakai menggunakan pustaka **SheetJS (xlsx)**.

---

### 📂 Struktur Direktori Proyek

```
New folder/
├── server.js               # Backend Express Server & REST API
├── database.js             # SQLite Database Client & CRUD Operations
├── package.json            # Konfigurasi dependensi Node.js
├── data/
│   └── elkpd.sqlite        # Berkas Database SQLite lokal
├── public/                 # Berkas Frontend yang Disajikan ke Browser
│   ├── index.html          # Modul Siswa (Multi-step Flow 9 Langkah)
│   ├── admin.html          # Modul Guru (Dashboard & Autentikasi)
│   ├── css/
│   │   ├── style.css       # Desain Modul Siswa (Tema Otomotif Navy-Gold)
│   │   └── admin.css       # Desain Dashboard Guru (Modern Tailwind-like UI)
│   ├── js/
│   │   ├── app.js          # Controller Siswa: Wizard, Timer, DnD, & Auto-grading
│   │   └── admin.js        # Controller Guru: Auth, Filter, Tabel, & Export Excel
│   └── assets/             # Aset gambar & ilustrasi resolusi tinggi
│       ├── bengkel_mobil.jpg
│       ├── lkpd_cover_decor.png
│       ├── service_record_real.png
│       └── service_record_form.png
└── README.md               # Dokumentasi Teknis Aplikasi
```

---

### 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Server Node.js:**
   ```bash
   node server.js
   ```
2. **Akses Melalui Browser:**
   - **Modul Siswa (Multi-step):** [http://localhost:3000](http://localhost:3000)
   - **Portal Guru / Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Password Default Guru:** `admin123`

---

### 📡 Dokumentasi Endpoint REST API

| Method | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions` | Mengirim data pengerjaan e-LKPD siswa | Publik (Siswa) |
| `POST` | `/api/admin/login` | Autentikasi login Guru dengan Password | Publik |
| `GET` | `/api/admin/verify` | Memvalidasi token sesi Guru | Guru (Bearer Token) |
| `GET` | `/api/admin/submissions` | Mengambil daftar pengumpulan siswa + statistik | Guru (Bearer Token) |
| `GET` | `/api/admin/submissions/:id` | Mengambil detail lengkap isian 1 siswa | Guru (Bearer Token) |
| `DELETE` | `/api/admin/submissions/:id` | Menghapus submission siswa | Guru (Bearer Token) |
| `GET` | `/api/admin/export` | Mengunduh file rekapitulasi Excel (`.xlsx`) | Guru (Bearer Token) |
