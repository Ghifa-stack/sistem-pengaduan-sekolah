'use client'

import { useState, useTransition } from 'react'
import { tugaskanPetugasAdmin } from '@/app/actions/pengaduan'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UserCheck, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PenugasanModalProps {
  pengaduanId: string
  nomorTiket: string
  petugasSaatIniId?: string | null
  daftarPetugas: Array<{
    id: string
    nama: string
    email: string
  }>
}

export function PenugasanModal({
  pengaduanId,
  nomorTiket,
  petugasSaatIniId,
  daftarPetugas,
}: PenugasanModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedPetugas, setSelectedPetugas] = useState<string>(petugasSaatIniId || 'UNASSIGNED')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSimpan() {
    startTransition(async () => {
      const targetId = selectedPetugas === 'UNASSIGNED' ? null : selectedPetugas
      const res = await tugaskanPetugasAdmin(pengaduanId, targetId)
      if (res.success) {
        toast({
          title: 'Petugas Ditugaskan',
          description: res.message,
        })
        setOpen(false)
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal Menugaskan',
          description: res.message,
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Tugaskan Petugas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Penugasan Penanganan</DialogTitle>
          <DialogDescription>
            Pilih staf/petugas sekolah yang bertanggung jawab atas tiket <strong className="font-mono text-gray-900">{nomorTiket}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <Label className="text-xs font-semibold text-gray-700">Pilih Petugas Sekolah</Label>
          <Select
            value={selectedPetugas}
            onValueChange={setSelectedPetugas}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Pilih Petugas..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNASSIGNED">-- Belum Ditugaskan --</SelectItem>
              {daftarPetugas.map((petugas) => (
                <SelectItem key={petugas.id} value={petugas.id}>
                  {petugas.nama} ({petugas.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSimpan}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Penugasan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
