'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateNomorTiket } from '@/lib/utils-pengaduan'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { KategoriPengaduan, StatusPengaduan } from '@prisma/client'

// =============================================
// SCHEMA VALIDASI
// =============================================

const SchemaDaftar = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  konfirmasiPassword: z.string(),
}).refine((data) => data.password === data.konfirmasiPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['konfirmasiPassword'],
})

const SchemaPengaduan = z.object({
  judul: z.string()
    .min(10, 'Judul minimal 10 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  deskripsi: z.string()
    .min(30, 'Deskripsi minimal 30 karakter')
    .max(5000, 'Deskripsi maksimal 5000 karakter'),
  kategori: z.nativeEnum(KategoriPengaduan, {
    errorMap: () => ({ message: 'Pilih kategori yang valid' }),
  }),
})

// =============================================
// ACTION: DAFTAR AKUN
// =============================================

export async function daftarAkun(prevState: any, formData: FormData) {
  const rawData = {
    nama: formData.get('nama') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    konfirmasiPassword: formData.get('konfirmasiPassword') as string,
  }

  // Validasi
  const result = SchemaDaftar.safeParse(rawData)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Data tidak valid. Periksa kembali isian Anda.',
    }
  }

  const { nama, email, password } = result.data

  // Cek email sudah terdaftar
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return {
      success: false,
      errors: { email: ['Email sudah terdaftar. Gunakan email lain.'] },
      message: 'Email sudah terdaftar.',
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Buat akun
  await prisma.user.create({
    data: { nama, email, passwordHash, role: 'PELAPOR' },
  })

  return {
    success: true,
    message: 'Akun berhasil dibuat! Silakan masuk dengan akun Anda.',
  }
}

// =============================================
// ACTION: KIRIM PENGADUAN
// =============================================

export async function kirimPengaduan(prevState: any, formData: FormData) {
  // Verifikasi sesi
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Anda harus masuk terlebih dahulu.' }
  }

  if (session.user.role !== 'PELAPOR') {
    return { success: false, message: 'Hanya pelapor yang bisa mengirim pengaduan.' }
  }

  const rawData = {
    judul: (formData.get('judul') as string)?.trim(),
    deskripsi: (formData.get('deskripsi') as string)?.trim(),
    kategori: formData.get('kategori') as string,
  }

  // Validasi
  const result = SchemaPengaduan.safeParse(rawData)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Data tidak valid. Periksa kembali isian Anda.',
    }
  }

  const { judul, deskripsi, kategori } = result.data

  // Generate nomor tiket unik
  let nomorTiket = generateNomorTiket()
  let isUnique = false
  let attempt = 0
  while (!isUnique && attempt < 5) {
    const existing = await prisma.pengaduan.findUnique({ where: { nomorTiket } })
    if (!existing) {
      isUnique = true
    } else {
      nomorTiket = generateNomorTiket()
      attempt++
    }
  }

  // Simpan ke database (transaction)
  const pengaduan = await prisma.$transaction(async (tx) => {
    const p = await tx.pengaduan.create({
      data: {
        nomorTiket,
        judul,
        deskripsi,
        kategori,
        status: StatusPengaduan.BARU,
        pelaporId: session.user.id,
      },
    })

    // Catat log status awal
    await tx.statusLog.create({
      data: {
        pengaduanId: p.id,
        statusLama: null,
        statusBaru: StatusPengaduan.BARU,
        catatan: 'Pengaduan berhasil dikirim oleh pelapor.',
        userId: session.user.id,
      },
    })

    return p
  })

  revalidatePath('/dasbor')

  return {
    success: true,
    nomorTiket: pengaduan.nomorTiket,
    pengaduanId: pengaduan.id,
    message: `Pengaduan berhasil dikirim! Nomor tiket Anda: ${pengaduan.nomorTiket}`,
  }
}

// =============================================
// ACTION: AMBIL PENGADUAN PELAPOR (dengan filter & pencarian)
// =============================================

export async function getPengaduanSaya(query?: {
  cari?: string
  status?: string
  kategori?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return []

  const whereClause: any = {
    pelaporId: session.user.id,
  }

  // Filter pencarian (nomor tiket atau judul)
  if (query?.cari && query.cari.trim() !== '') {
    const search = query.cari.trim()
    whereClause.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { nomorTiket: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Filter status
  if (query?.status && query.status !== 'ALL') {
    whereClause.status = query.status as StatusPengaduan
  }

  // Filter kategori
  if (query?.kategori && query.kategori !== 'ALL') {
    whereClause.kategori = query.kategori as KategoriPengaduan
  }

  return prisma.pengaduan.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nomorTiket: true,
      judul: true,
      kategori: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          pesan: true,
        },
      },
    },
  })
}

// =============================================
// ACTION: DETAIL PENGADUAN (dengan otorisasi)
// =============================================

export async function getDetailPengaduan(pengaduanId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id: pengaduanId },
    include: {
      pelapor: { select: { id: true, nama: true, email: true } },
      petugas: { select: { id: true, nama: true, email: true } },
      statusLogs: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, nama: true, role: true } },
        },
      },
      pesan: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, nama: true, role: true } },
        },
      },
    },
  })

  if (!pengaduan) return null

  // Pelapor hanya bisa melihat pengaduannya sendiri
  if (session.user.role === 'PELAPOR' && pengaduan.pelaporId !== session.user.id) {
    return null
  }

  return pengaduan
}

// =============================================
// SCHEMA & ACTION: KIRIM PESAN TANGGAPAN
// =============================================

const SchemaPesan = z.object({
  pengaduanId: z.string().min(1, 'ID pengaduan tidak valid'),
  isi: z.string().min(2, 'Pesan minimal 2 karakter').max(3000, 'Pesan maksimal 3000 karakter'),
})

export async function kirimPesan(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Anda harus masuk terlebih dahulu.' }
  }

  const rawData = {
    pengaduanId: (formData.get('pengaduanId') as string)?.trim(),
    isi: (formData.get('isi') as string)?.trim(),
  }

  const result = SchemaPesan.safeParse(rawData)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Pesan tidak valid.',
    }
  }

  const { pengaduanId, isi } = result.data

  // Verifikasi akses ke pengaduan
  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id: pengaduanId },
  })

  if (!pengaduan) {
    return { success: false, message: 'Pengaduan tidak ditemukan.' }
  }

  // Hanya pelapor terkait atau ADMIN yang bisa mengirim pesan di thread ini
  if (session.user.role === 'PELAPOR' && pengaduan.pelaporId !== session.user.id) {
    return { success: false, message: 'Anda tidak memiliki akses ke pengaduan ini.' }
  }

  // Buat pesan baru
  await prisma.pesan.create({
    data: {
      pengaduanId,
      userId: session.user.id,
      isi,
    },
  })

  revalidatePath(`/pengaduan/${pengaduanId}`)
  revalidatePath('/dasbor')

  return {
    success: true,
    message: 'Tanggapan berhasil dikirim.',
  }
}

// =============================================
// ACTION: TANDAI SELESAI OLEH PELAPOR
// =============================================

export async function tandaiSelesaiPelapor(pengaduanId: string, catatan?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Anda harus masuk terlebih dahulu.' }
  }

  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id: pengaduanId },
  })

  if (!pengaduan) {
    return { success: false, message: 'Pengaduan tidak ditemukan.' }
  }

  if (pengaduan.pelaporId !== session.user.id && session.user.role !== 'ADMIN') {
    return { success: false, message: 'Anda tidak memiliki hak untuk menandai pengaduan ini.' }
  }

  if (pengaduan.status === 'SELESAI') {
    return { success: false, message: 'Pengaduan ini sudah berstatus selesai.' }
  }

  // Update status menjadi SELESAI dan catat status log
  await prisma.$transaction(async (tx) => {
    await tx.pengaduan.update({
      where: { id: pengaduanId },
      data: { status: StatusPengaduan.SELESAI },
    })

    await tx.statusLog.create({
      data: {
        pengaduanId,
        statusLama: pengaduan.status,
        statusBaru: StatusPengaduan.SELESAI,
        catatan: catatan?.trim() || 'Pelapor menandai pengaduan telah terselesaikan dengan baik.',
        userId: session.user.id,
      },
    })
  })

  revalidatePath(`/pengaduan/${pengaduanId}`)
  revalidatePath('/dasbor')

  return {
    success: true,
    message: 'Pengaduan berhasil ditandai sebagai selesai.',
  }
}

// =============================================
// FASE 3: SERVER ACTIONS UNTUK ADMIN
// =============================================

// 1. Ambil Semua Pengaduan untuk Admin (dengan search, filter, pagination)
export async function getSemuaPengaduanAdmin(query?: {
  cari?: string
  status?: string
  kategori?: string
  periode?: string // 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'ALL'
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Akses ditolak: Hanya admin yang diizinkan.')
  }

  const page = Math.max(1, Number(query?.page) || 1)
  const limit = Math.max(1, Number(query?.limit) || 10)
  const skip = (page - 1) * limit

  const whereClause: any = {}

  // Filter pencarian
  if (query?.cari && query.cari.trim() !== '') {
    const search = query.cari.trim()
    whereClause.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { nomorTiket: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } },
      { pelapor: { nama: { contains: search, mode: 'insensitive' } } },
      { pelapor: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Filter status
  if (query?.status && query.status !== 'ALL') {
    whereClause.status = query.status as StatusPengaduan
  }

  // Filter kategori
  if (query?.kategori && query.kategori !== 'ALL') {
    whereClause.kategori = query.kategori as KategoriPengaduan
  }

  // Filter periode
  if (query?.periode && query.periode !== 'ALL') {
    const now = new Date()
    if (query.periode === 'hari_ini') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      whereClause.createdAt = { gte: startOfDay }
    } else if (query.periode === 'minggu_ini') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - 7)
      whereClause.createdAt = { gte: startOfWeek }
    } else if (query.periode === 'bulan_ini') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      whereClause.createdAt = { gte: startOfMonth }
    }
  }

  const [total, data] = await Promise.all([
    prisma.pengaduan.count({ where: whereClause }),
    prisma.pengaduan.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        pelapor: { select: { id: true, nama: true, email: true } },
        petugas: { select: { id: true, nama: true } },
        _count: { select: { pesan: true } },
      },
    }),
  ])

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  }
}

// 2. Statistik Ringkasan Prioritas untuk Admin
export async function getStatistikAdmin(filter?: { periode?: string; kategori?: string }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Akses ditolak: Hanya admin yang diizinkan.')
  }

  const whereClause: any = {}

  if (filter?.kategori && filter.kategori !== 'ALL') {
    whereClause.kategori = filter.kategori as KategoriPengaduan
  }

  if (filter?.periode && filter.periode !== 'ALL') {
    const now = new Date()
    if (filter.periode === 'hari_ini') {
      whereClause.createdAt = { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
    } else if (filter.periode === 'minggu_ini') {
      const past = new Date(now)
      past.setDate(now.getDate() - 7)
      whereClause.createdAt = { gte: past }
    } else if (filter.periode === 'bulan_ini') {
      whereClause.createdAt = { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
    }
  }

  // Ambil semua untuk hitung statistik dan breakdown
  const semua = await prisma.pengaduan.findMany({
    where: whereClause,
    select: {
      status: true,
      kategori: true,
      createdAt: true,
    },
  })

  const total = semua.length
  const baru = semua.filter((p) => p.status === 'BARU').length
  const diproses = semua.filter((p) => p.status === 'DIPROSES').length
  const selesai = semua.filter((p) => p.status === 'SELESAI').length
  const ditolak = semua.filter((p) => p.status === 'DITOLAK').length

  // Hitung Layanan Paling Sering Dilaporkan
  const kategoriCounts: Record<string, number> = {
    SARANA_PRASARANA: 0,
    AKADEMIK: 0,
    KEBERSIHAN: 0,
    KEAMANAN: 0,
    PELAYANAN_ADMINISTRASI: 0,
    LAINNYA: 0,
  }

  semua.forEach((p) => {
    if (kategoriCounts[p.kategori] !== undefined) {
      kategoriCounts[p.kategori]++
    }
  })

  const kategoriUrut = Object.entries(kategoriCounts)
    .map(([kategori, count]) => ({
      kategori: kategori as KategoriPengaduan,
      count,
      persentase: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    total,
    baru,
    diproses,
    selesai,
    ditolak,
    kategoriUrut,
  }
}

// 3. Ubah Status Pengaduan + Catatan Resmi oleh Admin
export async function ubahStatusPengaduanAdmin(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, message: 'Akses ditolak.' }
  }

  const pengaduanId = formData.get('pengaduanId') as string
  const statusBaru = formData.get('statusBaru') as StatusPengaduan
  const catatan = (formData.get('catatan') as string)?.trim()

  if (!pengaduanId || !statusBaru) {
    return { success: false, message: 'Data tidak lengkap.' }
  }

  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id: pengaduanId },
  })

  if (!pengaduan) {
    return { success: false, message: 'Pengaduan tidak ditemukan.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.pengaduan.update({
      where: { id: pengaduanId },
      data: { status: statusBaru },
    })

    await tx.statusLog.create({
      data: {
        pengaduanId,
        statusLama: pengaduan.status,
        statusBaru,
        catatan: catatan || `Status diubah menjadi ${statusBaru} oleh Admin.`,
        userId: session.user.id,
      },
    })
  })

  revalidatePath(`/admin/pengaduan/${pengaduanId}`)
  revalidatePath('/admin/pengaduan')
  revalidatePath('/admin')
  revalidatePath(`/pengaduan/${pengaduanId}`)
  revalidatePath('/dasbor')

  return {
    success: true,
    message: `Status berhasil diperbarui menjadi ${statusBaru}.`,
  }
}

// 4. Tugaskan Petugas / Unit oleh Admin
export async function tugaskanPetugasAdmin(pengaduanId: string, petugasId: string | null) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, message: 'Akses ditolak.' }
  }

  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id: pengaduanId },
    include: { petugas: true },
  })

  if (!pengaduan) {
    return { success: false, message: 'Pengaduan tidak ditemukan.' }
  }

  let namaPetugasBaru = 'Belum Ditugaskan'
  if (petugasId) {
    const p = await prisma.user.findUnique({ where: { id: petugasId } })
    if (p) namaPetugasBaru = p.nama
  }

  await prisma.$transaction(async (tx) => {
    await tx.pengaduan.update({
      where: { id: pengaduanId },
      data: { petugasId },
    })

    await tx.statusLog.create({
      data: {
        pengaduanId,
        statusLama: pengaduan.status,
        statusBaru: pengaduan.status,
        catatan: `Penugasan penanganan diperbarui: ${namaPetugasBaru}.`,
        userId: session.user.id,
      },
    })
  })

  revalidatePath(`/admin/pengaduan/${pengaduanId}`)
  revalidatePath('/admin/pengaduan')

  return {
    success: true,
    message: `Petugas penanggung jawab berhasil diperbarui.`,
  }
}

// 5. Ambil Daftar Seluruh Petugas (Admin) untuk Dropdown Penugasan
export async function getDaftarPetugasAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return []

  return prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, nama: true, email: true },
    orderBy: { nama: 'asc' },
  })
}
