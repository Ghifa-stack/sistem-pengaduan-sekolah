'use client'

import { useState, useTransition } from 'react'
import { tandaiSelesaiPelapor } from '@/app/actions/pengaduan'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface TandaiSelesaiDialogProps {
  pengaduanId: string
  nomorTiket: string
}

export function TandaiSelesaiDialog({ pengaduanId, nomorTiket }: TandaiSelesaiDialogProps) {
  const [open, setOpen] = useState(false)
  const [catatan, setCatatan] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleKonfirmasi() {
    startTransition(async () => {
      const res = await tandaiSelesaiPelapor(pengaduanId, catatan)
      if (res.success) {
        toast({
          title: 'Pengaduan Selesai',
          description: 'Terima kasih telah mengonfirmasi bahwa masalah telah terselesaikan.',
        })
        setOpen(false)
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
        <Button
          variant="outline"
          size="sm"
          className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Tandai Selesai</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <DialogTitle>Tandai Pengaduan Selesai?</DialogTitle>
          <DialogDescription>
            Apakah masalah pada tiket <strong className="font-mono text-gray-900">{nomorTiket}</strong> sudah terselesaikan dengan baik oleh pihak sekolah?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="catatan-selesai" className="text-xs font-medium text-gray-700">
            Catatan Tambahan atau Ucapan (Opsional)
          </Label>
          <Textarea
            id="catatan-selesai"
            placeholder="Contoh: Terima kasih, fasilitas sudah diperbaiki dan dapat digunakan kembali dengan nyaman."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            className="text-sm resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400">
            Status pengaduan akan diperbarui menjadi <strong>Selesai</strong> dan tercatat di riwayat timeline.
          </p>
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
            onClick={handleKonfirmasi}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Ya, Tandai Selesai
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
