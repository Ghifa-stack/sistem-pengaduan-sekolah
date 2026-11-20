'use client'

import { useState, useTransition } from 'react'
import { ubahStatusPengaduanAdmin } from '@/app/actions/pengaduan'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LABEL_STATUS, WARNA_STATUS } from '@/lib/utils-pengaduan'
import { StatusPengaduan } from '@prisma/client'

interface UbahStatusModalProps {
  pengaduanId: string
  nomorTiket: string
  statusSaatIni: StatusPengaduan
}

export function UbahStatusModal({
  pengaduanId,
  nomorTiket,
  statusSaatIni,
}: UbahStatusModalProps) {
  const [open, setOpen] = useState(false)
  const [statusBaru, setStatusBaru] = useState<StatusPengaduan>(statusSaatIni)
  const [catatan, setCatatan] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPending) return

    const formData = new FormData()
    formData.append('pengaduanId', pengaduanId)
    formData.append('statusBaru', statusBaru)
    formData.append('catatan', catatan)

    startTransition(async () => {
      const res = await ubahStatusPengaduanAdmin(formData)
      if (res.success) {
        toast({
          title: 'Status Diperbarui',
          description: `Pengaduan ${nomorTiket} berhasil diubah menjadi ${LABEL_STATUS[statusBaru]}.`,
        })
        setOpen(false)
        setCatatan('')
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: res.message,
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1.5 shadow-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ubah Status</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ubah Status Pengaduan</DialogTitle>
            <DialogDescription>
              Perbarui progres penanganan untuk tiket <strong className="font-mono text-gray-900">{nomorTiket}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status Saat Ini */}
            <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500">Status Saat Ini:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium border ${WARNA_STATUS[statusSaatIni]}`}>
                {LABEL_STATUS[statusSaatIni]}
              </span>
            </div>

            {/* Pilihan Status Baru */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Pilih Status Baru *</Label>
              <Select
                value={statusBaru}
                onValueChange={(val) => setStatusBaru(val as StatusPengaduan)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BARU">🔵 Baru (Menunggu)</SelectItem>
                  <SelectItem value="DIPROSES">🟡 Diproses (Sedang Ditindaklanjuti)</SelectItem>
                  <SelectItem value="SELESAI">🟢 Selesai (Masalah Teratasi)</SelectItem>
                  <SelectItem value="DITOLAK">🔴 Ditolak (Tidak Valid / Diluar Wewenang)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Catatan Tindak Lanjut */}
            <div className="space-y-1.5">
              <Label htmlFor="catatan-admin" className="text-xs font-semibold text-gray-700">
                Catatan Resmi Tindak Lanjut / Alasan Perubahan *
              </Label>
              <Textarea
                id="catatan-admin"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Tim sarpras telah selesai memperbaiki kran dan membersihkan area toilet."
                rows={3}
                required
                maxLength={1000}
                className="text-sm resize-none"
              />
              <p className="text-[11px] text-gray-400">
                Catatan ini akan tersimpan di riwayat timeline dan dapat dibaca oleh pelapor.
              </p>
            </div>
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
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
