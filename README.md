# Sistem Layanan Pengaduan Sekolah — SiPengadu

Aplikasi web pengaduan layanan sekolah berbasis **Next.js 14 + PostgreSQL + Prisma + NextAuth.js**.

---

## 🚀 Cara Menjalankan (Fase 1)

### Prasyarat
- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

### Langkah Setup

```bash
# 1. Clone atau buka folder proyek
cd pengaduan-sekolah

# 2. Install dependencies
npm install

# 3. Jalankan database PostgreSQL via Docker
docker compose up -d postgres

# 4. Tunggu ~5 detik, lalu inisialisasi schema
npm run db:push

# 5. Isi data contoh (seed)
npm run db:seed

# 6. Jalankan aplikasi
npm run dev
```

Buka **http://localhost:3000**

### Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Siswa (Pelapor) | budi@siswa.id | siswa123 |
| Siswa (Pelapor) | siti@siswa.id | siswa123 |
| Admin | admin@sekolah.id | admin123 |

---

## 📁 Struktur Proyek

```
pengaduan-sekolah/
├── app/
│   ├── (pelapor)/           # Route group: halaman siswa
│   │   ├── layout.tsx       # Layout dengan navbar pelapor
│   │   ├── dasbor/          # Dashboard siswa
│   │   ├── kirim-pengaduan/ # Form kirim pengaduan
│   │   └── pengaduan/[id]/  # Detail pengaduan + timeline
│   ├── admin/               # Halaman admin (dikembangkan Fase 3)
│   ├── api/auth/            # NextAuth API handler
│   ├── actions/             # Server Actions (logika bisnis)
│   ├── daftar/              # Halaman daftar akun
│   ├── masuk/               # Halaman login
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── pelapor/             # Komponen khusus pelapor
├── lib/
│   ├── prisma.ts            # Prisma singleton
│   ├── utils.ts             # cn() helper
│   └── utils-pengaduan.ts   # Label, warna, format tanggal
├── prisma/
│   ├── schema.prisma        # Schema database
│   └── seed.ts              # Data awal
├── types/
│   └── next-auth.d.ts       # Type augmentation
├── auth.ts                  # Konfigurasi NextAuth
├── middleware.ts            # Auth & route protection
├── docker-compose.yml
└── .env
```

---

## 🗄️ Struktur Database (Fase 1)

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | CUID | Primary key |
| nama | String | Nama lengkap |
| email | String UNIQUE | Alamat email |
| password_hash | String | bcrypt hash |
| role | Enum | PELAPOR / ADMIN |
| created_at | DateTime | |
| updated_at | DateTime | |

### Tabel `pengaduan`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | CUID | Primary key |
| nomor_tiket | String UNIQUE | ADU-YYYYMM-XXXXX |
| judul | String | Judul pengaduan |
| deskripsi | Text | Isi pengaduan |
| kategori | Enum | Kategori layanan |
| status | Enum | BARU/DIPROSES/SELESAI/DITOLAK |
| pelapor_id | FK → users | |
| created_at | DateTime | |
| updated_at | DateTime | |

### Tabel `status_logs`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | CUID | Primary key |
| pengaduan_id | FK → pengaduan | |
| status_lama | Enum? | null saat pertama buat |
| status_baru | Enum | Status setelah perubahan |
| catatan | Text? | Keterangan perubahan |
| user_id | FK → users | Siapa yang mengubah |
| created_at | DateTime | |

---

## 🔗 Halaman & Endpoint (Fase 1)

### Halaman (Pages)
| URL | Deskripsi | Akses |
|-----|-----------|-------|
| `/` | Landing page | Publik |
| `/daftar` | Form daftar akun | Publik |
| `/masuk` | Form login | Publik |
| `/dasbor` | Dashboard pelapor | Pelapor |
| `/kirim-pengaduan` | Form kirim pengaduan | Pelapor |
| `/pengaduan/[id]` | Detail + timeline | Pelapor (pemilik) |
| `/admin` | Dashboard admin (stub) | Admin |

### API Endpoints
| Endpoint | Metode | Deskripsi |
|----------|--------|-----------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |

### Server Actions
| Action | Deskripsi |
|--------|-----------|
| `daftarAkun()` | Registrasi akun baru |
| `kirimPengaduan()` | Kirim pengaduan + generate tiket |
| `getPengaduanSaya()` | Ambil daftar pengaduan pelapor |
| `getDetailPengaduan()` | Detail pengaduan + status logs |

---

## ✅ Checklist Fase 1

### Fitur Utama
- [x] Form kirim pengaduan (judul + deskripsi)
- [x] Validasi input (Zod) — judul min 10, deskripsi min 30 karakter
- [x] Sanitasi input (trim whitespace)
- [x] Pilih kategori layanan (6 kategori)
- [x] Generate nomor tiket unik (ADU-YYYYMM-XXXXX)
- [x] Halaman konfirmasi + salin nomor tiket
- [x] Log status awal otomatis saat pengaduan dibuat

### Auth & Keamanan
- [x] Hash password dengan bcrypt (salt 12)
- [x] Autentikasi JWT via NextAuth.js
- [x] Proteksi route via middleware
- [x] Pelapor hanya bisa lihat pengaduannya sendiri
- [x] Role-based access control (PELAPOR / ADMIN)
- [x] Redirect otomatis berdasarkan role setelah login

### UI/UX
- [x] Responsif mobile-first
- [x] Antarmuka Bahasa Indonesia
- [x] Counter karakter pada textarea
- [x] Loading state pada semua tombol submit
- [x] Pesan error per field yang spesifik
- [x] Halaman sukses dengan nomor tiket + tombol salin
- [x] Dasbor dengan statistik pengaduan
- [x] Timeline riwayat status di halaman detail
- [x] Landing page dengan CTA

### Database
- [x] Schema Prisma lengkap (3 tabel)
- [x] Relasi dan index yang optimal
- [x] Data seed untuk demo
- [x] Transaction saat simpan pengaduan + log

---

## 🔧 Perintah Berguna

```bash
# Jalankan dev server
npm run dev

# Buka Prisma Studio (GUI database)
npm run db:studio

# Reset database dan seed ulang
npm run db:reset

# Build production
npm run build
```

---

## 📅 Roadmap Fase Berikutnya

| Fase | Fitur |
|------|-------|
| **Fase 2** | Lacak status, timeline detail, percakapan pelapor-admin |
| **Fase 3** | Panel admin: kelola pengaduan, ubah status, statistik |
| **Fase 4** | Manajemen akun, profil, ubah password |
