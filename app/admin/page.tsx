import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getStatistikAdmin } from '@/app/actions/pengaduan'
import { NavbarAdmin } from '@/components/admin/navbar-admin'
import { FilterStatistik } from '@/components/admin/filter-statistik'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LABEL_KATEGORI } from '@/lib/utils-pengaduan'
import Link from 'next/link'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Inbox,
  Sparkles,
} from 'lucide-react'

export default async function HalamanAdmin({
  searchParams,
}: {
  searchParams?: {
    periode?: string
    kategori?: string
  }
}) {
  const session = await auth()
  if (!session) redirect('/masuk')
  if (session.user.role !== 'ADMIN') redirect('/dasbor')

  const stats = await getStatistikAdmin({
    periode: searchParams?.periode,
    kategori: searchParams?.kategori,
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin user={session.user} />

      <main className="flex-1 container mx-auto px-4 max-w-6xl py-8 space-y-6">
        {/* Header Dashboard & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Ringkasan Prioritas Sekolah
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Pantau beban keluhan, layanan kritis, dan efektivitas penanganan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterStatistik />
            <Button asChild className="gap-1.5 shadow-xs">
              <Link href="/admin/pengaduan">
                <Inbox className="w-4 h-4" />
                <span>Kelola Pengaduan</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Kartu Statistik Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Pengaduan',
              value: stats.total,
              sub: 'Seluruh laporan masuk',
              icon: ClipboardList,
              color: 'blue',
              href: '/admin/pengaduan',
            },
            {
              label: 'Perlu Ditangani (Baru)',
              value: stats.baru,
              sub: 'Menunggu konfirmasi',
              icon: AlertCircle,
              color: 'amber',
              href: '/admin/pengaduan?status=BARU',
            },
            {
              label: 'Sedang Diproses',
              value: stats.diproses,
              sub: 'Dalam tindak lanjut',
              icon: Clock,
              color: 'yellow',
              href: '/admin/pengaduan?status=DIPROSES',
            },
            {
              label: 'Telah Terselesaikan',
              value: stats.selesai,
              sub: `${stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0}% tingkat penyelesaian`,
              icon: CheckCircle2,
              color: 'green',
              href: '/admin/pengaduan?status=SELESAI',
            },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="group">
              <Card className="border-0 shadow-xs hover:shadow-sm transition-all group-hover:border-gray-300">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">{item.label}</span>
                    <div className={`w-8 h-8 rounded-lg bg-${item.color}-100 flex items-center justify-center text-${item.color}-700`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">{item.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Action Callout if there are new complaints */}
        {stats.baru > 0 && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  Ada {stats.baru} pengaduan baru yang belum ditangani!
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Segera periksa dan ubah status pengaduan agar siswa mendapat kepastian tindak lanjut.
                </p>
              </div>
            </div>
            <Button size="sm" asChild variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0">
              <Link href="/admin/pengaduan?status=BARU" className="gap-1.5">
                <span>Tinjau Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* Bagian: Layanan Paling Sering Dilaporkan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Layanan Paling Sering Dilaporkan
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Identifikasi bidang yang membutuhkan alokasi sumber daya atau perbaikan prioritas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {stats.kategoriUrut.map((item, idx) => (
                <div key={item.kategori} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-4 text-gray-400 font-mono text-[11px]">#{idx + 1}</span>
                      <span>{LABEL_KATEGORI[item.kategori]}</span>
                    </span>
                    <span className="text-gray-500 font-mono">
                      <strong>{item.count}</strong> laporan ({item.persentase}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-red-500'
                          : idx === 1
                          ? 'bg-amber-500'
                          : idx === 2
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.persentase}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats Panel: Efisiensi & Ringkasan */}
          <Card className="border-0 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">
                Status Operasional
              </CardTitle>
              <CardDescription className="text-xs">
                Perbandingan status laporan aktif
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
                <span className="text-blue-900 font-medium">Laporan Baru:</span>
                <span className="font-bold text-blue-700">{stats.baru}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50/70 border border-yellow-100 text-xs">
                <span className="text-yellow-900 font-medium">Dalam Penanganan:</span>
                <span className="font-bold text-yellow-700">{stats.diproses}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50/70 border border-green-100 text-xs">
                <span className="text-green-900 font-medium">Selesai Teratasi:</span>
                <span className="font-bold text-green-700">{stats.selesai}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-50/70 border border-red-100 text-xs">
                <span className="text-red-900 font-medium">Ditolak / Tidak Valid:</span>
                <span className="font-bold text-red-700">{stats.ditolak}</span>
              </div>
            </CardContent>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
              <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                <Link href="/admin/pengaduan">
                  <span>Lihat Seluruh Daftar Laporan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
