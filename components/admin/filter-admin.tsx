'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RotateCcw, Filter, Download, Calendar } from 'lucide-react'

export function FilterAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentCari = searchParams.get('cari') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentKategori = searchParams.get('kategori') || 'ALL'
  const currentPeriode = searchParams.get('periode') || 'ALL'

  const [cari, setCari] = useState(currentCari)

  function updateParams(newParams: { cari?: string; status?: string; kategori?: string; periode?: string }) {
    const params = new URLSearchParams(searchParams.toString())

    // Reset pagination to page 1 on filter change
    params.delete('page')

    if (newParams.cari !== undefined) {
      if (newParams.cari.trim()) params.set('cari', newParams.cari.trim())
      else params.delete('cari')
    }

    if (newParams.status !== undefined) {
      if (newParams.status && newParams.status !== 'ALL') params.set('status', newParams.status)
      else params.delete('status')
    }

    if (newParams.kategori !== undefined) {
      if (newParams.kategori && newParams.kategori !== 'ALL') params.set('kategori', newParams.kategori)
      else params.delete('kategori')
    }

    if (newParams.periode !== undefined) {
      if (newParams.periode && newParams.periode !== 'ALL') params.set('periode', newParams.periode)
      else params.delete('periode')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ cari })
  }

  function handleReset() {
    setCari('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const exportUrl = `/api/admin/ekspor-csv?${searchParams.toString()}`

  const hasFilter = Boolean(
    currentCari ||
    (currentStatus && currentStatus !== 'ALL') ||
    (currentKategori && currentKategori !== 'ALL') ||
    (currentPeriode && currentPeriode !== 'ALL')
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 space-y-3">
      {/* Baris 1: Pencarian & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari tiket, judul, nama pelapor, atau email..."
              className="pl-9 pr-3 h-10 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="h-10 px-4" disabled={isPending}>
            Cari
          </Button>
          {hasFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-10 px-3 text-gray-500 hover:text-gray-900"
              title="Reset Semua Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </form>

        {/* Tombol Ekspor CSV */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-10 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <a href={exportUrl} download>
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </a>
        </Button>
      </div>

      {/* Baris 2: Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-gray-100">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 min-w-12">Status:</span>
          <Select
            value={currentStatus}
            onValueChange={(val) => updateParams({ status: val })}
          >
            <SelectTrigger className="h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="BARU">🔵 Baru</SelectItem>
              <SelectItem value="DIPROSES">🟡 Diproses</SelectItem>
              <SelectItem value="SELESAI">🟢 Selesai</SelectItem>
              <SelectItem value="DITOLAK">🔴 Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kategori */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 min-w-14">Kategori:</span>
          <Select
            value={currentKategori}
            onValueChange={(val) => updateParams({ kategori: val })}
          >
            <SelectTrigger className="h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              <SelectItem value="SARANA_PRASARANA">🏗️ Sarana & Prasarana</SelectItem>
              <SelectItem value="AKADEMIK">📚 Akademik</SelectItem>
              <SelectItem value="KEBERSIHAN">🧹 Kebersihan</SelectItem>
              <SelectItem value="KEAMANAN">🔒 Keamanan</SelectItem>
              <SelectItem value="PELAYANAN_ADMINISTRASI">📋 Administrasi</SelectItem>
              <SelectItem value="LAINNYA">💬 Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Periode */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 min-w-14">Periode:</span>
          <Select
            value={currentPeriode}
            onValueChange={(val) => updateParams({ periode: val })}
          >
            <SelectTrigger className="h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Semua Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Waktu</SelectItem>
              <SelectItem value="hari_ini">Hari Ini</SelectItem>
              <SelectItem value="minggu_ini">7 Hari Terakhir</SelectItem>
              <SelectItem value="bulan_ini">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
