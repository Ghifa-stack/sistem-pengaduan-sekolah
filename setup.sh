#!/usr/bin/env bash
# setup.sh — Jalankan sekali untuk setup lengkap proyek
set -e

echo "🚀 Setup Sistem Pengaduan Sekolah..."

# 1. Install dependencies
echo "📦 Menginstall dependencies..."
npm install

# 2. Jalankan Docker Compose (database)
echo "🐳 Menjalankan PostgreSQL via Docker..."
docker compose up -d postgres

# 3. Tunggu database siap
echo "⏳ Menunggu database siap..."
sleep 5

# 4. Push schema ke database
echo "🗄️  Menginisialisasi schema database..."
npm run db:push

# 5. Seed data awal
echo "🌱 Mengisi data awal (seed)..."
npm run db:seed

echo ""
echo "✅ Setup selesai!"
echo ""
echo "Jalankan: npm run dev"
echo "Buka: http://localhost:3000"
echo ""
echo "Akun demo:"
echo "  Siswa : budi@siswa.id / siswa123"
echo "  Admin : admin@sekolah.id / admin123"
