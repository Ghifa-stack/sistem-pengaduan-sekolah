import { KategoriPengaduan, StatusPengaduan } from '@prisma/client'

// Label kategori dalam Bahasa Indonesia
export const LABEL_KATEGORI: Record<KategoriPengaduan, string> = {
  SARANA_PRASARANA: 'Sarana & Prasarana',
  AKADEMIK: 'Akademik',
  KEBERSIHAN: 'Kebersihan',
  KEAMANAN: 'Keamanan',
  PELAYANAN_ADMINISTRASI: 'Pelayanan Administrasi',
  LAINNYA: 'Lainnya',
}

// Label status dalam Bahasa Indonesia
export const LABEL_STATUS: Record<StatusPengaduan, string> = {
  BARU: 'Baru',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
}

// Warna badge per status
export const WARNA_STATUS: Record<StatusPengaduan, string> = {
  BARU: 'bg-blue-100 text-blue-800 border-blue-200',
  DIPROSES: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SELESAI: 'bg-green-100 text-green-800 border-green-200',
  DITOLAK: 'bg-red-100 text-red-800 border-red-200',
}

// Warna ikon kategori
export const WARNA_KATEGORI: Record<KategoriPengaduan, string> = {
  SARANA_PRASARANA: 'text-orange-600 bg-orange-50',
  AKADEMIK: 'text-blue-600 bg-blue-50',
  KEBERSIHAN: 'text-green-600 bg-green-50',
  KEAMANAN: 'text-red-600 bg-red-50',
  PELAYANAN_ADMINISTRASI: 'text-purple-600 bg-purple-50',
  LAINNYA: 'text-gray-600 bg-gray-50',
}

// Generate nomor tiket unik
export function generateNomorTiket(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 90000) + 10000
  return `ADU-${year}${month}-${random}`
}

// Format tanggal ke Bahasa Indonesia
export function formatTanggal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format tanggal pendek
export function formatTanggalPendek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
