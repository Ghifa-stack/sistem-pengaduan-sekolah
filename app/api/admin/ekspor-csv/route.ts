import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { LABEL_KATEGORI, LABEL_STATUS } from '@/lib/utils-pengaduan'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Akses ditolak', { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const kategori = searchParams.get('kategori')
  const cari = searchParams.get('cari')

  const whereClause: any = {}

  if (cari && cari.trim() !== '') {
    const s = cari.trim()
    whereClause.OR = [
      { judul: { contains: s, mode: 'insensitive' } },
      { nomorTiket: { contains: s, mode: 'insensitive' } },
      { pelapor: { nama: { contains: s, mode: 'insensitive' } } },
    ]
  }

  if (status && status !== 'ALL') {
    whereClause.status = status
  }

  if (kategori && kategori !== 'ALL') {
    whereClause.kategori = kategori
  }

  const data = await prisma.pengaduan.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      pelapor: { select: { nama: true, email: true } },
      petugas: { select: { nama: true } },
      _count: { select: { pesan: true } },
    },
  })

  // Format CSV
  const headers = [
    'Nomor Tiket',
    'Judul',
    'Kategori',
    'Status',
    'Nama Pelapor',
    'Email Pelapor',
    'Petugas Penanggung Jawab',
    'Jumlah Tanggapan',
    'Tanggal Lapor',
  ]

  const rows = data.map((item) => [
    `"${item.nomorTiket}"`,
    `"${item.judul.replace(/"/g, '""')}"`,
    `"${LABEL_KATEGORI[item.kategori] || item.kategori}"`,
    `"${LABEL_STATUS[item.status] || item.status}"`,
    `"${item.pelapor.nama.replace(/"/g, '""')}"`,
    `"${item.pelapor.email}"`,
    `"${item.petugas?.nama || 'Belum Ditugaskan'}"`,
    item._count.pesan,
    `"${new Date(item.createdAt).toLocaleString('id-ID')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

  return new NextResponse('\uFEFF' + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-pengaduan-sekolah-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
