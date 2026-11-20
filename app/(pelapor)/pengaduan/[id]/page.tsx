import { getDetailPengaduan } from '@/app/actions/pengaduan'
import { auth } from '@/auth'
import { LABEL_KATEGORI, LABEL_STATUS, WARNA_STATUS, formatTanggal } from '@/lib/utils-pengaduan'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThreadPercakapan } from '@/components/pelapor/thread-percakapan'
import { TandaiSelesaiDialog } from '@/components/pelapor/tandai-selesai-dialog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  History,
} from 'lucide-react'
import { StatusPengaduan } from '@prisma/client'

// Icon dan warna untuk timeline
function getStatusIcon(status: StatusPengaduan) {
  switch (status) {
    case 'BARU':
      return <FileText className="w-4 h-4 text-blue-600" />
    case 'DIPROSES':
      return <Clock className="w-4 h-4 text-yellow-600" />
    case 'SELESAI':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case 'DITOLAK':
      return <XCircle className="w-4 h-4 text-red-600" />
  }
}

function getTimelineDotColor(status: StatusPengaduan) {
  switch (status) {
    case 'BARU': return 'bg-blue-500'
    case 'DIPROSES': return 'bg-yellow-500'
    case 'SELESAI': return 'bg-green-500'
    case 'DITOLAK': return 'bg-red-500'
  }
}

export default async function HalamanDetailPengaduan({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const pengaduan = await getDetailPengaduan(params.id)

  if (!pengaduan || !session) notFound()

  const canMarkCompleted = pengaduan.status !== 'SELESAI' && pengaduan.status !== 'DITOLAK'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigasi & Aksi */}
      <div className="flex items-center justify-between">
        <Link
          href="/dasbor"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dasbor
        </Link>

        {canMarkCompleted && (
          <TandaiSelesaiDialog
            pengaduanId={pengaduan.id}
            nomorTiket={pengaduan.nomorTiket}
          />
        )}
      </div>

      {/* Header pengaduan */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Stripe status */}
        <div
          className={`h-1.5 ${
            pengaduan.status === 'SELESAI'
              ? 'bg-green-500'
              : pengaduan.status === 'DIPROSES'
              ? 'bg-yellow-500'
              : pengaduan.status === 'DITOLAK'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
        />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-semibold">
                  {pengaduan.nomorTiket}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${WARNA_STATUS[pengaduan.status]}`}
                >
                  {getStatusIcon(pengaduan.status)}
                  <span className="ml-1.5">{LABEL_STATUS[pengaduan.status]}</span>
                </span>
              </div>
              <CardTitle className="text-xl leading-tight text-gray-900">{pengaduan.judul}</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block mb-0.5">Kategori</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                {LABEL_KATEGORI[pengaduan.kategori]}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Pelapor</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                {pengaduan.pelapor.nama}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Tanggal Lapor</span>
              <span className="font-medium text-gray-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                {formatTanggal(pengaduan.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">ID Tiket</span>
              <span className="font-mono text-gray-600 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                {pengaduan.id.slice(0, 10)}...
              </span>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Deskripsi Keluhan</h3>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-4 border border-gray-200">
              {pengaduan.deskripsi}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Riwayat Timeline Status & Percakapan Tanggapan */}
      <div className="space-y-6">
        {/* Section Percakapan Tanggapan */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Percakapan Tanggapan</CardTitle>
                  <CardDescription className="text-xs">
                    Thread komunikasi antara pelapor dan pihak sekolah
                  </CardDescription>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {pengaduan.pesan.length} pesan
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ThreadPercakapan
              pengaduanId={pengaduan.id}
              statusPengaduan={pengaduan.status}
              currentUserId={session.user.id}
              pesanList={pengaduan.pesan}
            />
          </CardContent>
        </Card>

        {/* Section Riwayat Perubahan Status (Timeline) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Riwayat Perubahan Status</CardTitle>
                <CardDescription className="text-xs">
                  Catatan audit log setiap penanganan dan update status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {pengaduan.statusLogs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada riwayat status.</p>
            ) : (
              <div className="relative">
                {/* Garis vertikal timeline */}
                <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {pengaduan.statusLogs.map((log) => (
                    <div key={log.id} className="relative flex gap-4 pl-9">
                      {/* Dot status */}
                      <div
                        className={`absolute left-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${getTimelineDotColor(log.statusBaru)}`}
                        style={{ top: '3px' }}
                      />

                      {/* Konten */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${WARNA_STATUS[log.statusBaru]}`}
                          >
                            {LABEL_STATUS[log.statusBaru]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTanggal(log.createdAt)}
                          </span>
                        </div>

                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                          {log.catatan && (
                            <p className="text-xs sm:text-sm text-gray-700 mb-2 leading-relaxed">
                              {log.catatan}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            <span>
                              {log.user.nama}
                              <span className="ml-1.5 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">
                                {log.user.role === 'ADMIN' ? 'Petugas Sekolah' : 'Pelapor'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
