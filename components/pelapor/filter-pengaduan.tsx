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
import { Search, RotateCcw, Filter, CheckCircle2, Clock, FileText, XCircle } from 'lucide-react'

export function FilterPengaduan() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentCari = searchParams.get('cari') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentKategori = searchParams.get('kategori') || 'ALL'

  const [cari, setCari] = useState(currentCari)

  function updateParams(newParams: { cari?: string; status?: string; kategori?: string }) {
    const params = new URLSearchParams(searchParams.toString())

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

  const hasActiveFilter = Boolean(currentCari || (currentStatus && currentStatus !== 'ALL') || (currentKategori && currentKategori !== 'ALL'))

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Search Bar & Reset */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari berdasarkan nomor tiket, judul, atau isi keluhan..."
            className="pl-9 pr-4 h-10 text-sm"
          />
        </div>
        <Button type="submit" size="sm" className="h-10 px-4" disabled={isPending}>
          Cari
        </Button>
        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-10 px-3 text-gray-500 hover:text-gray-800"
            title="Reset filter"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </form>

      {/* Filter Kategori & Status */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>

        {/* Dropdown Kategori */}
        <div className="w-[180px] sm:w-[220px]">
          <Select
            value={currentKategori}
            onValueChange={(val) => updateParams({ kategori: val })}
          >
            <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              <SelectItem value="SARANA_PRASARANA">🏗️ Sarana & Prasarana</SelectItem>
              <SelectItem value="AKADEMIK">📚 Akademik</SelectItem>
              <SelectItem value="KEBERSIHAN">🧹 Kebersihan</SelectItem>
              <SelectItem value="KEAMANAN">🔒 Keamanan</SelectItem>
              <SelectItem value="PELAYANAN_ADMINISTRASI">📋 Pelayanan Administrasi</SelectItem>
              <SelectItem value="LAINNYA">💬 Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Quick Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {[
            { value: 'ALL', label: 'Semua Status' },
            { value: 'BARU', label: 'Baru', color: 'hover:bg-blue-50 text-blue-700' },
            { value: 'DIPROSES', label: 'Diproses', color: 'hover:bg-yellow-50 text-yellow-700' },
            { value: 'SELESAI', label: 'Selesai', color: 'hover:bg-green-50 text-green-700' },
            { value: 'DITOLAK', label: 'Ditolak', color: 'hover:bg-red-50 text-red-700' },
          ].map((s) => {
            const isSelected = currentStatus === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => updateParams({ status: s.value })}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
