import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { NavbarAdmin } from '@/components/admin/navbar-admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, Home } from 'lucide-react'

export default async function HalamanAdmin() {
  const session = await auth()
  if (!session) redirect('/masuk')
  if (session.user.role !== 'ADMIN') redirect('/dasbor')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin user={session.user} />

      <main className="flex-1 container mx-auto px-4 max-w-3xl py-12 flex items-center justify-center">
        <Card className="border-0 shadow-sm w-full text-center p-8">
          <CardContent className="space-y-4 p-0">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Panel Admin Sekolah
            </h1>

            <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
              Selamat datang, <strong>{session.user.name}</strong>. Anda saat ini masuk dengan peran <strong>Petugas / Admin Sekolah</strong>.
            </p>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 max-w-md mx-auto">
              Fitur lengkap sisi Admin (kelola semua pengaduan, ubah status, penugasan petugas, dan statistik ringkasan) akan dibuka pada <strong>Fase 3</strong>.
            </div>

            <div className="pt-4 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Ke Halaman Awal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
