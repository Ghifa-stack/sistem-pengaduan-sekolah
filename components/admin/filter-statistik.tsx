'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, Calendar } from 'lucide-react'

export function FilterStatistik() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentPeriode = searchParams.get('periode') || 'ALL'
  const currentKategori = searchParams.get('kategori') || 'ALL'

  function updateParams(newParams: { periode?: string; kategori?: string }) {
    const params = new URLSearchParams(searchParams.toString())

    if (newParams.periode !== undefined) {
      if (newParams.periode && newParams.periode !== 'ALL') params.set('periode', newParams.periode)
      else params.delete('periode')
    }

    if (newParams.kategori !== undefined) {
      if (newParams.kategori && newParams.kategori !== 'ALL') params.set('kategori', newParams.kategori)
      else params.delete('kategori')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span>Filter Statistik:</span>
      </div>

      {/* Periode */}
      <div className="w-[150px]">
        <Select
          value={currentPeriode}
          onValueChange={(val) => updateParams({ periode: val })}
        >
          <SelectTrigger className="h-8 text-xs bg-white">
            <SelectValue placeholder="Semua Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Waktu</SelectItem>
            <SelectItem value="hari_ini">Hari Ini</SelectItem>
            <SelectItem value="minggu_ini">7 Hari Terakhir</SelectItem>
            <SelectItem value="bulan_ini">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kategori */}
      <div className="w-[170px]">
        <Select
          value={currentKategori}
          onValueChange={(val) => updateParams({ kategori: val })}
        >
          <SelectTrigger className="h-8 text-xs bg-white">
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
    </div>
  )
}
