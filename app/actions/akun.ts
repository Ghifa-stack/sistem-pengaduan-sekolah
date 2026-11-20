'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// =============================================
// SCHEMAS VALIDASI
// =============================================

const SchemaUpdateProfil = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  telepon: z.string().max(20, 'Nomor telepon maksimal 20 karakter').optional().nullable(),
})

const SchemaUbahPassword = z.object({
  passwordLama: z.string().min(1, 'Kata sandi saat ini harus diisi'),
  passwordBaru: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
  konfirmasiPasswordBaru: z.string(),
}).refine((data) => data.passwordBaru === data.konfirmasiPasswordBaru, {
  message: 'Konfirmasi kata sandi baru tidak cocok',
  path: ['konfirmasiPasswordBaru'],
})

const SchemaResetPassword = z.object({
  email: z.string().email('Format email tidak valid'),
  passwordBaru: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
  konfirmasiPasswordBaru: z.string(),
}).refine((data) => data.passwordBaru === data.konfirmasiPasswordBaru, {
  message: 'Konfirmasi kata sandi baru tidak cocok',
  path: ['konfirmasiPasswordBaru'],
})

// =============================================
// ACTION: AMBIL DATA PROFIL PENGGUNA AKTIF
// =============================================

export async function getProfilSaya() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nama: true,
      email: true,
      telepon: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          pengaduan: true,
          tugasPengaduan: true,
          pesan: true,
        },
      },
    },
  })

  return user
}

// =============================================
// ACTION: PERBARUI PROFIL
// =============================================

export async function updateProfil(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Anda harus masuk terlebih dahulu.' }
  }

  const rawData = {
    nama: (formData.get('nama') as string)?.trim(),
    telepon: (formData.get('telepon') as string)?.trim() || null,
  }

  const result = SchemaUpdateProfil.safeParse(rawData)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Data profil tidak valid. Periksa isian Anda.',
    }
  }

  const { nama, telepon } = result.data

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nama, telepon },
  })

  revalidatePath('/profil')
  revalidatePath('/dasbor')
  revalidatePath('/admin')

  return {
    success: true,
    message: 'Profil Anda berhasil diperbarui!',
  }
}

// =============================================
// ACTION: UBAH KATA SANDI (DARI HALAMAN PROFIL)
// =============================================

export async function ubahKataSandi(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Anda harus masuk terlebih dahulu.' }
  }

  const rawData = {
    passwordLama: formData.get('passwordLama') as string,
    passwordBaru: formData.get('passwordBaru') as string,
    konfirmasiPasswordBaru: formData.get('konfirmasiPasswordBaru') as string,
  }

  const result = SchemaUbahPassword.safeParse(rawData)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Periksa kembali formulir kata sandi Anda.',
    }
  }

  const { passwordLama, passwordBaru } = result.data

  // Verifikasi kata sandi lama
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    return { success: false, message: 'Pengguna tidak ditemukan.' }
  }

  const isMatch = await bcrypt.compare(passwordLama, user.passwordHash)
  if (!isMatch) {
    return {
      success: false,
      errors: { passwordLama: ['Kata sandi saat ini salah.'] },
      message: 'Kata sandi saat ini tidak cocok.',
    }
  }

  // Hash kata sandi baru
  const passwordHash = await bcrypt.hash(passwordBaru, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  })

  revalidatePath('/profil')

  return {
    success: true,
    message: 'Kata sandi berhasil diubah! Gunakan kata sandi baru untuk login berikutnya.',
  }
}

// =============================================
// ACTION: RESET KATA SANDI (LUPA KATA SANDI)
// =============================================

export async function resetKataSandi(prevState: any, formData: FormData) {
  const rawData = {
    email: (formData.get('email') as string)?.trim().toLowerCase(),
    passwordBaru: formData.get('passwordBaru') as string,
    konfirmasiPasswordBaru: formData.get('konfirmasiPasswordBaru') as string,
  }

  const result = SchemaResetPassword.safeParse(rawData)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Periksa kembali isian formulir reset kata sandi.',
    }
  }

  const { email, passwordBaru } = result.data

  // Periksa apakah email terdaftar
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return {
      success: false,
      errors: { email: ['Email ini tidak terdaftar di sistem pengaduan sekolah.'] },
      message: 'Email tidak ditemukan.',
    }
  }

  // Update kata sandi
  const passwordHash = await bcrypt.hash(passwordBaru, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  return {
    success: true,
    message: 'Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru Anda.',
  }
}
