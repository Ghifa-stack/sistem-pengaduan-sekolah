import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSemuaPengaduanAdmin } from '@/app/actions/pengaduan'
import { NavbarAdmin } from '@/components/admin/navbar-admin'
import { FilterAdmin } from '@/components/admin/filter-admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LABEL_KATEGORI, LABEL_STATUS, WARNA_STATUS, formatTanggalPendek } from '@/lib/utils-pengaduan'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  ArrowRight,
  SearchX,
  FileSpreadsheet,
} from 'lucide-react'

export default async function HalamanKelolaPengaduan({
  searchParams,
}: {
  searchParams?: {
    cari?: string
    status?: string
    kategori?: string
    periode?: string
    page?: string
  }
}) {
  const session = await auth()
  if (!session) redirect('/masuk')
  if (session.user.role !== 'ADMIN') redirect('/dasbor')

  const currentPage = Math.max(1, Number(searchParams?.page) || 1)

  const result = await getSemuaPengaduanAdmin({
    cari: searchParams?.cari,
    status: searchParams?.status,
    kategori: searchParams?.kategori,
    periode: searchParams?.periode,
    page: currentPage,
    limit: 10,
  })

  // Helper untuk navigasi halaman
  function getPageUrl(p: number) {
    const params = new URLSearchParams()
    if (searchParams?.cari) params.set('cari', searchParams.cari)
    if (searchParams?.status) params.set('status', searchParams.status)
    if (searchParams?.kategori) params.set('kategori', searchParams.kategori)
    if (searchParams?.periode) params.set('periode', searchParams.periode)
    params.set('page', String(p))
    return `/admin/pengaduan?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarAdmin user={session.user} />

      <main className="flex-1 container mx-auto px-4 max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Kelola Semua Pengaduan
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Daftar seluruh laporan keluhan warga sekolah beserta status tindak lanjutnya.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <FilterAdmin />

        {/* Tabel Data Pengaduan */}
        <Card className="border-0 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-100 bg-white">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Data Laporan
              </CardTitle>
              <CardDescription className="text-xs">
                Total {result.total} pengaduan ditemukan (Halaman {result.page} dari {result.totalPages})
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 bg-white">
            {result.data.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <SearchX className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">Tidak ada pengaduan</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Tidak ditemukan laporan pengaduan yang sesuai dengan kriteria filter saat ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">Tiket & Judul</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Pelapor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Petugas PJ</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Tiket & Judul */}
                        <td className="py-3.5 px-4 sm:px-6 max-w-xs">
                          <span className="font-mono text-xs font-semibold text-gray-500 block">
                            {item.nomorTiket}
                          </span>
                          <span className="font-medium text-gray-900 line-clamp-1 block mt-0.5">
                            {item.judul}
                          </span>
                          {item._count.pesan > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded mt-1">
                              <MessageSquare className="w-2.5 h-2.5" />
                              {item._count.pesan} respon
                            </span>
                          )}
                        </td>

                        {/* Kategori */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                          {LABEL_KATEGORI[item.kategori]}
                        </td>

                        {/* Pelapor */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-800 block">
                            {item.pelapor.nama}
                          </span>
                          <span className="text-[11px] text-gray-400 block font-mono">
                            {item.pelapor.email}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${WARNA_STATUS[item.status]}`}
                          >
                            {LABEL_STATUS[item.status]}
                          </span>
                        </td>

                        {/* Petugas PJ */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          {item.petugas ? (
                            <span className="text-gray-800 font-medium flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-500" />
                              {item.petugas.nama}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Belum ditugaskan</span>
                          )}
                        </td>

                        {/* Tanggal */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-500">
                          {formatTanggalPendek(item.createdAt)}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button asChild size="sm" variant="ghost" className="h-8 gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                            <Link href={`/admin/pengaduan/${item.id}`}>
                              <span>Detail</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {result.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Halaman <strong>{result.page}</strong> dari <strong>{result.totalPages}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    disabled={result.page <= 1}
                    className="h-8 px-2.5"
                  >
                    {result.page > 1 ? (
                      <Link href={getPageUrl(result.page - 1)} className="gap-1">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Sebelumnya</span>
                      </Link>
                    ) : (
                      <span className="gap-1 flex items-center text-gray-300">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Sebelumnya</span>
                      </span>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    disabled={result.page >= result.totalPages}
                    className="h-8 px-2.5"
                  >
                    {result.page < result.totalPages ? (
                      <Link href={getPageUrl(result.page + 1)} className="gap-1">
                        <span className="hidden sm:inline text-xs">Berikutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="gap-1 flex items-center text-gray-300">
                        <span className="hidden sm:inline text-xs">Berikutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
