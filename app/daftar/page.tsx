'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { daftarAkun } from '@/app/actions/pengaduan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { ClipboardList, Loader2, CheckCircle2 } from 'lucide-react'

function TombolDaftar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Mendaftarkan...
        </>
      ) : (
        'Daftar Sekarang'
      )}
    </Button>
  )
}

export default function HalamanDaftar() {
  const [state, action] = useFormState(daftarAkun, null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SiPengadu</h1>
          <p className="text-gray-500 text-sm mt-1">Sistem Pengaduan Sekolah</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
            <CardDescription>
              Daftarkan diri untuk mulai mengirim pengaduan
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Pesan sukses */}
            {state?.success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {state.message}{' '}
                  <Link href="/masuk" className="font-semibold underline">
                    Klik di sini untuk masuk
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {/* Pesan error global */}
            {state && !state.success && state.message && !state.errors && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <form action={action} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1.5">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  placeholder="Contoh: Budi Santoso"
                  className={state?.errors?.nama ? 'border-red-400' : ''}
                />
                {state?.errors?.nama && (
                  <p className="text-xs text-red-600">{state.errors.nama[0]}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Alamat Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@sekolah.id"
                  className={state?.errors?.email ? 'border-red-400' : ''}
                />
                {state?.errors?.email && (
                  <p className="text-xs text-red-600">{state.errors.email[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  className={state?.errors?.password ? 'border-red-400' : ''}
                />
                {state?.errors?.password && (
                  <p className="text-xs text-red-600">{state.errors.password[0]}</p>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-1.5">
                <Label htmlFor="konfirmasiPassword">Konfirmasi Kata Sandi</Label>
                <Input
                  id="konfirmasiPassword"
                  name="konfirmasiPassword"
                  type="password"
                  placeholder="Ketik ulang kata sandi"
                  className={state?.errors?.konfirmasiPassword ? 'border-red-400' : ''}
                />
                {state?.errors?.konfirmasiPassword && (
                  <p className="text-xs text-red-600">{state.errors.konfirmasiPassword[0]}</p>
                )}
              </div>

              <TombolDaftar />
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t pt-4">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link href="/masuk" className="text-blue-600 font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600">← Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  )
}
