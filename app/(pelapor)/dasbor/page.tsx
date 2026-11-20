import { getPengaduanSaya } from '@/app/actions/pengaduan'
import { auth } from '@/auth'
import { LABEL_KATEGORI, LABEL_STATUS, WARNA_STATUS, formatTanggalPendek } from '@/lib/utils-pengaduan'
import { FilterPengaduan } from '@/components/pelapor/filter-pengaduan'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  Plus,
  ClipboardList,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  MessageSquare,
  SearchX,
} from 'lucide-react'

export default async function HalamanDasbor({
  searchParams,
}: {
  searchParams?: {
    cari?: string
    status?: string
    kategori?: string
  }
}) {
  const session = await auth()

  // Ambil semua untuk hitung statistik
  const allPengaduan = await getPengaduanSaya()

  // Ambil dengan filter / search
  const filteredList = await getPengaduanSaya({
    cari: searchParams?.cari,
    status: searchParams?.status,
    kategori: searchParams?.kategori,
  })

  // Hitung statistik dari semua pengaduan
  const stats = {
    total: allPengaduan.length,
    baru: allPengaduan.filter((p) => p.status === 'BARU').length,
    diproses: allPengaduan.filter((p) => p.status === 'DIPROSES').length,
    selesai: allPengaduan.filter((p) => p.status === 'SELESAI').length,
  }

  const isFiltering = Boolean(
    searchParams?.cari ||
    (searchParams?.status && searchParams.status !== 'ALL') ||
    (searchParams?.kategori && searchParams.kategori !== 'ALL')
  )

  return (
    <div className="space-y-6">
      {/* Sambutan */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Halo, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Pantau status penanganan dan percakapan tanggapan sekolah.
          </p>
        </div>
        <Button asChild className="gap-2 hidden sm:flex">
          <Link href="/kirim-pengaduan">
            <Plus className="w-4 h-4" />
            Kirim Pengaduan
          </Link>
        </Button>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Keluhan', value: stats.total, icon: ClipboardList, color: 'blue' },
          { label: 'Menunggu (Baru)', value: stats.baru, icon: FileText, color: 'blue' },
          { label: 'Sedang Diproses', value: stats.diproses, icon: Clock, color: 'yellow' },
          { label: 'Telah Selesai', value: stats.selesai, icon: CheckCircle2, color: 'green' },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 text-${s.color}-600`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Search Bar */}
      {allPengaduan.length > 0 && <FilterPengaduan />}

      {/* Daftar pengaduan */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Daftar Pengaduan Saya</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Menampilkan {filteredList.length} dari {allPengaduan.length} pengaduan
            </p>
          </div>
          <Button asChild size="sm" className="gap-1 sm:hidden">
            <Link href="/kirim-pengaduan">
              <Plus className="w-3 h-3" />
              Kirim
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {allPengaduan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Belum ada pengaduan</h3>
              <p className="text-sm text-gray-500 mb-6">
                Anda belum pernah mengirim pengaduan. Mulai kirim sekarang!
              </p>
              <Button asChild>
                <Link href="/kirim-pengaduan">
                  <Plus className="w-4 h-4 mr-2" />
                  Kirim Pengaduan Pertama
                </Link>
              </Button>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <SearchX className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">Tidak ditemukan</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Tidak ada pengaduan yang cocok dengan kata kunci atau filter yang Anda pilih.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredList.map((p) => (
                <Link
                  key={p.id}
                  href={`/pengaduan/${p.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{p.nomorTiket}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${WARNA_STATUS[p.status]}`}
                      >
                        {LABEL_STATUS[p.status]}
                      </span>
                      {p._count?.pesan > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          <MessageSquare className="w-3 h-3" />
                          {p._count.pesan} tanggapan
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {p.judul}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {LABEL_KATEGORI[p.kategori]}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {formatTanggalPendek(p.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
