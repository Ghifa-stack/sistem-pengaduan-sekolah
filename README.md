# 🏫 SiPengadu — Sistem Layanan Pengaduan Sekolah

Platform aplikasi web terpadu untuk memudahkan warga sekolah (siswa/guru/wali) menyampaikan keluhan dan aspirasi layanan sekolah secara terstruktur, transparan, dan akuntabel, serta membantu pihak sekolah memprioritaskan perbaikan fasilitas dan mutu layanan.

---

## 🌟 Gambaran Umum & Fitur Aplikasi

Aplikasi ini dirancang dengan antarmuka yang modern, bersih, mobile-first, dan sepenuhnya berbahasa Indonesia. Terdapat dua peran utama pengguna dalam sistem:

### 1. 🧑‍🎓 Sisi Pelapor (Siswa / Warga Sekolah)
- **Akun & Autentikasi Mandiri:** Pendaftaran akun baru, login aman berbasis session JWT, dan pengaturan ulang (reset) kata sandi mandiri jika lupa.
- **Formulir Pengaduan Cerdas:**
  - Validasi panjang input judul (min 10) dan deskripsi (min 30).
  - Pilihan 6 kategori layanan resmi (*Sarana & Prasarana, Akademik, Kebersihan, Keamanan, Pelayanan Administrasi, dan Lainnya*).
  - Generator Nomor Tiket unik otomatis berformat `ADU-YYYYMM-XXXXX`.
  - Halaman konfirmasi instan beserta tombol salin nomor tiket.
- **Dasbor Pengaduan Saya:**
  - Statistik ringkasan personal (*Total, Menunggu, Diproses, Selesai*).
  - Pencarian bebas berdasarkan nomor tiket, judul, maupun isi keluhan.
  - Filter cepat status (*Pills*) dan filter kategori layanan.
  - Indikator jumlah balasan/tanggapan pada kartu tiket.
- **Detail & Riwayat Perubahan Status (Timeline):**
  - Garis waktu kronologis (*Audit Trail*) mencatat kapan status berubah, siapa yang menindaklanjuti, dan catatan penjelasan pihak sekolah.
- **Thread Percakapan Dua Arah:**
  - Ruang tanya jawab (*Balas & Tanya Lanjut*) antara pelapor dan petugas sekolah dengan pembeda lencana identitas yang jelas.
- **Tandai Selesai Mandiri:**
  - Pelapor dapat mengonfirmasi dan menutup tiket jika fasilitas atau keluhan telah terselesaikan dengan baik.
- **Pengaturan Profil:**
  - Pembaruan nama lengkap, nomor kontak/WhatsApp, dan penggantian kata sandi dari dalam akun.

### 2. 🛡️ Sisi Admin / Petugas Sekolah
- **Dashboard Ringkasan Prioritas (`/admin`):**
  - 4 Kartu metrik operasional (*Total Pengaduan, Perlu Ditangani/Baru, Sedang Diproses, Selesai*).
  - Peringatan (*Callout Alert*) tiket baru yang membutuhkan respon cepat.
  - **Layanan Paling Sering Dilaporkan:** Analitik grafik persentase keluhan terbanyak untuk membantu manajemen sekolah menentukan prioritas anggaran dan perbaikan.
  - Filter periode waktu (*Hari Ini, 7 Hari Terakhir, Bulan Ini*) dan kategori layanan.
- **Manajemen Semua Pengaduan (`/admin/pengaduan`):**
  - Tabel data responsif dengan pagination.
  - Pencarian multi-kriteria (tiket, judul, nama siswa, email).
  - **Ekspor Laporan CSV:** Fitur unduh berkas rekapitulasi data keluhan terfilter yang kompatibel dengan Microsoft Excel / Google Sheets.
- **Tindak Lanjut & Delegasi Penanganan:**
  - **Ubah Status Tiket:** Mengubah status laporan (*Baru $\rightarrow$ Diproses $\rightarrow$ Selesai / Ditolak*) disertai catatan resmi tindak lanjut yang otomatis tercatat di log audit.
  - **Penugasan Petugas / Unit:** Mendelegasikan tanggung jawab penanganan tiket ke akun staf sekolah tertentu.
  - **Kirim Tanggapan Resmi:** Mengirim pesan instruksi atau klarifikasi langsung di thread percakapan dengan lencana khusus *Petugas Sekolah*.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Autentikasi:** [NextAuth.js v5](https://authjs.dev/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (Salt 12)
- **Validasi Data:** [Zod](https://zod.dev/)
- **Styling & Komponen UI:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Containerization:** [Docker & Docker Compose](https://www.docker.com/)

---

## 🗄️ Skema Database

```mermaid
erDiagram
    users {
        string id PK
        string nama
        string email UK
        string telepon
        string password_hash
        enum role "PELAPOR | ADMIN"
        datetime created_at
        datetime updated_at
    }

    pengaduan {
        string id PK
        string nomor_tiket UK "ADU-YYYYMM-XXXXX"
        string judul
        text deskripsi
        enum kategori "SARANA_PRASARANA | AKADEMIK | KEBERSIHAN | KEAMANAN | PELAYANAN_ADMINISTRASI | LAINNYA"
        enum status "BARU | DIPROSES | SELESAI | DITOLAK"
        string pelapor_id FK
        string petugas_id FK "nullable"
        datetime created_at
        datetime updated_at
    }

    status_logs {
        string id PK
        string pengaduan_id FK
        enum status_lama
        enum status_baru
        text catatan
        string user_id FK
        datetime created_at
    }

    pesan {
        string id PK
        string pengaduan_id FK
        string user_id FK
        text isi
        datetime created_at
    }

    users ||--o{ pengaduan : "membuat"
    users ||--o{ pengaduan : "ditugaskan sebagai PJ"
    users ||--o{ status_logs : "mencatat log"
    users ||--o{ pesan : "mengirim pesan"
    pengaduan ||--o{ status_logs : "riwayat audit"
    pengaduan ||--o{ pesan : "thread diskusi"
```

---

## 💻 Panduan Menjalankan di Laptop Sendiri

Ikuti langkah-langkah berikut untuk meng-clone dan menjalankan proyek ini di laptop atau komputer lokal Anda:

### 1. Prasyarat Sistem
Pastikan laptop Anda sudah terinstall:
- **Node.js** versi 20.x atau lebih baru ([Unduh Node.js](https://nodejs.org/))
- **Git** ([Unduh Git](https://git-scm.com/))
- **Docker Desktop** ([Unduh Docker](https://www.docker.com/products/docker-desktop)) *— direkomendasikan untuk menjalankan database PostgreSQL dengan 1 perintah.*

---

### 2. Clone Repository
Buka terminal (Git Bash / PowerShell / Terminal macOS) dan clone repository ini:

```bash
git clone https://github.com/Ghifa-stack/sistem-pengaduan-sekolah.git
cd sistem-pengaduan-sekolah
```

---

### 3. Install Dependencies
Install seluruh paket dependensi Node.js yang dibutuhkan:

```bash
npm install
```

---

### 4. Konfigurasi Environment Variables (`.env`)
Salin file template `.env.example` menjadi file `.env`:

```bash
# Windows PowerShell
copy .env.example .env

# Linux / macOS / Git Bash
cp .env.example .env
```

Pastikan isi file `.env` sesuai dengan konfigurasi lokal Anda:
```env
DATABASE_URL="postgresql://pengaduan_user:pengaduan_pass@localhost:5432/pengaduan_sekolah?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-key-ganti-di-production-32chars"
NODE_ENV="development"
```

---

### 5. Jalankan Database PostgreSQL
Gunakan Docker Compose untuk menjalankan database secara otomatis di background:

```bash
docker compose up -d postgres
```
*(Tunggu sekitar 5-10 detik agar service database siap menerima koneksi).*

> 💡 *Catatan:* Jika Anda menggunakan PostgreSQL native (tanpa Docker), pastikan PostgreSQL lokal Anda menyala di port 5432 dan sesuaikan username/password pada `DATABASE_URL` di file `.env`.

---

### 6. Migrasi Skema & Seeding Data Awal
Inisialisasi tabel database dan masukkan data contoh (akun demo & contoh pengaduan):

```bash
# Sinkronkan skema tabel ke database
npm run db:push

# Isi data awal (seed akun admin, siswa, dan pengaduan contoh)
npm run db:seed
```

---

### 7. Jalankan Server Pengembangan
Jalankan Next.js development server:

```bash
npm run dev
```

Buka browser Anda dan akses:  
👉 **`http://localhost:3000`**

---

## 🔑 Akun Demo untuk Pengujian

Database seed sudah dilengkapi dengan akun demo siap pakai:

| Peran (Role) | Alamat Email | Kata Sandi | Keterangan |
|---|---|---|---|
| **Admin / Petugas Sekolah** | `admin@sekolah.id` | `admin123` | Akses panel `/admin`, kelola semua pengaduan, ubah status, penugasan, dan ekspor CSV |
| **Siswa / Pelapor 1** | `budi@siswa.id` | `siswa123` | Akses `/dasbor`, memiliki contoh laporan toilet & percakapan |
| **Siswa / Pelapor 2** | `siti@siswa.id` | `siswa123` | Akses `/dasbor`, memiliki contoh laporan legalisir & keamanan |

---

## 📁 Struktur Direktori Proyek

```text
sistem-pengaduan-sekolah/
├── app/
│   ├── (pelapor)/               # Route group khusus pelapor
│   │   ├── dasbor/              # Dasbor siswa + filter & search
│   │   ├── kirim-pengaduan/     # Formulir pengaduan baru
│   │   ├── layout.tsx           # Layout pelapor + navbar pelapor
│   │   └── pengaduan/[id]/      # Detail pengaduan, thread pesan & timeline
│   ├── actions/                 # Server Actions (logika bisnis & database)
│   │   ├── akun.ts              # Action profil, ubah sandi & reset sandi
│   │   └── pengaduan.ts         # Action tiket, status, penugasan & filter
│   ├── admin/                   # Route khusus admin sekolah
│   │   ├── page.tsx             # Dashboard ringkasan prioritas & statistik
│   │   └── pengaduan/           # Tabel kelola pengaduan & detail admin
│   ├── api/                     # Route Handlers API (NextAuth, Ekspor CSV)
│   ├── daftar/                  # Halaman registrasi akun baru
│   ├── lupa-sandi/              # Halaman reset kata sandi mandiri
│   ├── masuk/                   # Halaman login
│   ├── profil/                  # Halaman profil & pengaturan akun
│   ├── globals.css              # Konfigurasi Tailwind CSS
│   ├── layout.tsx               # Root layout & Toaster provider
│   └── page.tsx                 # Landing page publik
├── components/
│   ├── admin/                   # Komponen admin (modal status, penugasan, navbar)
│   ├── pelapor/                 # Komponen pelapor (filter, thread chat, dialog selesai)
│   ├── profil/                  # Komponen profil (form edit profil & ubah password)
│   └── ui/                      # Komponen dasar shadcn/ui (button, dialog, card, dll)
├── lib/
│   ├── prisma.ts                # Prisma Client Singleton
│   ├── utils-pengaduan.ts       # Format tanggal, label status & kategori
│   └── utils.ts                 # Classname merge (cn) helper
├── prisma/
│   ├── schema.prisma            # Skema Prisma database PostgreSQL
│   └── seed.ts                  # Data seed awal untuk pengujian
├── auth.ts                      # Konfigurasi otentikasi NextAuth.js
├── docker-compose.yml           # Konfigurasi container PostgreSQL
├── middleware.ts                # Proteksi rute berbasis role & session
└── package.json
```

---

## 🛡️ Keamanan & Arsitektur

1. **Hashing Kata Sandi:** Semua kata sandi diamankan menggunakan `bcryptjs` dengan *salt cost factor* 12.
2. **Proteksi Akses Berlapis:**
   - Server-side middleware memverifikasi status login dan hak akses role (`ADMIN` vs `PELAPOR`).
   - Server Actions secara ketat memvalidasi kepemilikan tiket sebelum mengizinkan pembaruan data atau pengiriman pesan.
3. **Validasi & Sanitasi Data:** Semua input formulir divalidasi dengan schema `Zod` untuk mencegah *XSS* dan *malformed data*.
4. **Audit Trail Lengkap:** Setiap perubahan status pengaduan dicatat ke tabel `status_logs` lengkap dengan ID pelaku perubahan, stempel waktu, dan catatan resmi.

---

## 📜 Perintah Berguna

```bash
# Menjalankan Next.js di mode development
npm run dev

# Membuka Prisma Studio (GUI database berbasis browser)
npm run db:studio

# Reset dan seed ulang database
npm run db:reset

# Memeriksa pengecekan tipe TypeScript
npx tsc --noEmit

# Membangun aplikasi untuk production
npm run build
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pendidikan dan pengelolaan layanan fasilitas sekolah. Bebas dikembangkan lebih lanjut.
