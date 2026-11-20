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
