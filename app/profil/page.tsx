import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getProfilSaya } from '@/app/actions/akun'
import { NavbarPelapor } from '@/components/pelapor/navbar-pelapor'
import { NavbarAdmin } from '@/components/admin/navbar-admin'
import { FormEditProfil } from '@/components/profil/form-edit-profil'
import { FormUbahPassword } from '@/components/profil/form-ubah-password'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatTanggal } from '@/lib/utils-pengaduan'
import Link from 'next/link'
import {
  User,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Lock,
  ClipboardList,
  ArrowLeft,
  KeyRound,
  CheckCircle,
} from 'lucide-react'

export default async function HalamanProfil() {
  const session = await auth()
  if (!session) redirect('/masuk')

  const user = await getProfilSaya()
  if (!user) redirect('/masuk')

  const isAdmin = user.role === 'ADMIN'
  const backUrl = isAdmin ? '/admin' : '/dasbor'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigasi sesuai role */}
      {isAdmin ? <NavbarAdmin user={session.user} /> : <NavbarPelapor user={session.user} />}

      <main className="flex-1 container mx-auto px-4 max-w-4xl py-8 space-y-6">
        {/* Tombol Kembali */}
        <div>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Link>
        </div>

        {/* Kartu Profil Utama (Overview) */}
        <Card className="border-0 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-20" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
              <div className="flex items-end gap-3.5">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
                  <div className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-2xl ${
                    isAdmin ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">{user.nama}</h1>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isAdmin ? 'Admin / Petugas' : 'Siswa / Pelapor'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Metadata Ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Bergabung: <strong>{formatTanggal(user.createdAt)}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>Kontak: <strong>{user.telepon || 'Belum diisi'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ClipboardList className="w-4 h-4 text-gray-400" />
                <span>
                  {isAdmin ? (
                    <>Ditugaskan: <strong>{user._count.tugasPengaduan} tiket</strong></>
                  ) : (
                    <>Keluhan Diajukan: <strong>{user._count.pengaduan} tiket</strong></>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengaturan Akun: Dua Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Informasi Profil */}
          <Card className="border-0 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Informasi Pengguna</CardTitle>
                  <CardDescription className="text-xs">
                    Perbarui nama lengkap dan nomor telepon Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <FormEditProfil
                user={{
                  nama: user.nama,
                  email: user.email,
                  telepon: user.telepon,
                }}
              />
            </CardContent>
          </Card>

          {/* Form Ubah Kata Sandi */}
          <Card className="border-0 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Ubah Kata Sandi</CardTitle>
                  <CardDescription className="text-xs">
                    Pastikan kata sandi baru Anda minimal 8 karakter
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <FormUbahPassword />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
