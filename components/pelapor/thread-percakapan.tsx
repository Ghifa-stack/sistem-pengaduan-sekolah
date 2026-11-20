'use client'

import { useState, useRef, useTransition } from 'react'
import { kirimPesan } from '@/app/actions/pengaduan'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatTanggal } from '@/lib/utils-pengaduan'
import { MessageSquare, Send, User, ShieldCheck, CornerDownRight, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ThreadPercakapanProps {
  pengaduanId: string
  statusPengaduan: string
  currentUserId: string
  pesanList: Array<{
    id: string
    isi: string
    createdAt: Date | string
    user: {
      id: string
      nama: string
      role: string
    }
  }>
}

export function ThreadPercakapan({
  pengaduanId,
  statusPengaduan,
  currentUserId,
  pesanList,
}: ThreadPercakapanProps) {
  const [isi, setIsi] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isClosed = statusPengaduan === 'SELESAI' || statusPengaduan === 'DITOLAK'

  async function handleKirim(e: React.FormEvent) {
    e.preventDefault()
    if (!isi.trim() || isPending) return

    const formData = new FormData()
    formData.append('pengaduanId', pengaduanId)
    formData.append('isi', isi)

    startTransition(async () => {
      const res = await kirimPesan(null, formData)
      if (res.success) {
        setIsi('')
        toast({
          title: 'Tanggapan Terkirim',
          description: 'Pesan Anda telah ditambahkan ke thread pengaduan.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal Mengirim',
          description: res.message || 'Terjadi kesalahan.',
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* List Pesan Percakapan */}
      <div className="space-y-4">
        {pesanList.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 text-sm">Belum Ada Percakapan</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Thread ini digunakan untuk tanya jawab atau tanggapan langsung antara Anda dan pihak sekolah.
            </p>
          </div>
        ) : (
          pesanList.map((p) => {
            const isAdmin = p.user.role === 'ADMIN'
            const isMe = p.user.id === currentUserId

            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-xl p-4 transition-all border ${
                  isAdmin
                    ? 'bg-blue-50/70 border-blue-200/80'
                    : isMe
                    ? 'bg-white border-gray-200 shadow-2xs'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Header Pesan */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isAdmin
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-gray-900">
                          {p.user.nama}
                        </span>
                        {isAdmin ? (
                          <span className="text-[11px] font-medium bg-blue-600 text-white px-2 py-0.2 rounded-full">
                            Petugas Sekolah
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.2 rounded-full">
                            Pelapor
                          </span>
                        )}
                        {isMe && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            (Anda)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTanggal(p.createdAt)}
                  </span>
                </div>

                {/* Konten Pesan */}
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {p.isi}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Form Balas & Tanya Lanjut */}
      {isClosed ? (
        <div className="p-4 bg-gray-100 rounded-xl text-center text-xs text-gray-500 border border-gray-200">
          Thread percakapan ditutup karena pengaduan ini telah berstatus{' '}
          <strong className="text-gray-700">{statusPengaduan}</strong>.
        </div>
      ) : (
        <form onSubmit={handleKirim} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-700 flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5 text-blue-600" />
                Balas & Tanya Lanjut:
              </span>
              <span>{isi.length}/3000 karakter</span>
            </div>
            <Textarea
              ref={textareaRef}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Tulis pesan, tanggapan, atau pertanyaan lanjutan kepada petugas sekolah..."
              rows={3}
              maxLength={3000}
              className="resize-none text-sm focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isi.trim() || isPending}
              size="sm"
              className="gap-1.5 px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Kirim Balasan
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
