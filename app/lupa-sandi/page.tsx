'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { resetKataSandi } from '@/app/actions/akun'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { KeyRound, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

function TombolReset() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Memperbarui Kata Sandi...
        </>
      ) : (
        'Atur Ulang Kata Sandi'
      )}
    </Button>
  )
}

export default function HalamanLupaSandi() {
  const [state, action] = useFormState(resetKataSandi, null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg text-white">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Atur Ulang Kata Sandi</h1>
          <p className="text-gray-500 text-sm mt-1">Sistem Pengaduan Sekolah</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Lupa Kata Sandi?</CardTitle>
            <CardDescription>
              Masukkan alamat email Anda yang terdaftar dan tentukan kata sandi baru.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Pesan Sukses */}
            {state?.success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {state.message}{' '}
                  <Link href="/masuk" className="font-semibold underline block mt-1">
                    Klik di sini untuk Masuk ke Akun Anda →
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {/* Pesan Error Global */}
            {state && !state.success && state.message && !state.errors && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            {!state?.success && (
              <form action={action} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Terdaftar</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="email@siswa.id atau email@sekolah.id"
                    className={state?.errors?.email ? 'border-red-400' : ''}
                  />
                  {state?.errors?.email && (
                    <p className="text-xs text-red-600">{state.errors.email[0]}</p>
                  )}
                </div>

                {/* Password Baru */}
                <div className="space-y-1.5">
                  <Label htmlFor="passwordBaru">Kata Sandi Baru</Label>
                  <Input
                    id="passwordBaru"
                    name="passwordBaru"
                    type="password"
                    required
                    placeholder="Minimal 8 karakter"
                    className={state?.errors?.passwordBaru ? 'border-red-400' : ''}
                  />
                  {state?.errors?.passwordBaru && (
                    <p className="text-xs text-red-600">{state.errors.passwordBaru[0]}</p>
                  )}
                </div>

                {/* Konfirmasi Password Baru */}
                <div className="space-y-1.5">
                  <Label htmlFor="konfirmasiPasswordBaru">Konfirmasi Kata Sandi Baru</Label>
                  <Input
                    id="konfirmasiPasswordBaru"
                    name="konfirmasiPasswordBaru"
                    type="password"
                    required
                    placeholder="Ketik ulang kata sandi baru"
                    className={state?.errors?.konfirmasiPasswordBaru ? 'border-red-400' : ''}
                  />
                  {state?.errors?.konfirmasiPasswordBaru && (
                    <p className="text-xs text-red-600">{state.errors.konfirmasiPasswordBaru[0]}</p>
                  )}
                </div>

                <TombolReset />
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t pt-4">
            <p className="text-sm text-gray-500">
              Sudah ingat kata sandi?{' '}
              <Link href="/masuk" className="text-blue-600 font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  )
}
