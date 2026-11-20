'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { kirimPengaduan } from '@/app/actions/pengaduan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ClipboardCopy,
  ArrowLeft,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const KATEGORI_OPTIONS = [
  { value: 'SARANA_PRASARANA', label: '🏗️  Sarana & Prasarana', desc: 'Fasilitas, gedung, peralatan sekolah' },
  { value: 'AKADEMIK', label: '📚  Akademik', desc: 'Pembelajaran, guru, kurikulum' },
  { value: 'KEBERSIHAN', label: '🧹  Kebersihan', desc: 'Kebersihan lingkungan sekolah' },
  { value: 'KEAMANAN', label: '🔒  Keamanan', desc: 'Keamanan & ketertiban sekolah' },
  { value: 'PELAYANAN_ADMINISTRASI', label: '📋  Pelayanan Administrasi', desc: 'TU, surat, administrasi' },
  { value: 'LAINNYA', label: '💬  Lainnya', desc: 'Kategori lainnya' },
]

function TombolKirim() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Mengirim Pengaduan...
        </>
      ) : (
        'Kirim Pengaduan'
      )}
    </Button>
  )
}

export default function HalamanKirimPengaduan() {
  const [state, action] = useFormState(kirimPengaduan, null)
  const [kategoriValue, setKategoriValue] = useState('')
  const [deskripsiLength, setDeskripsiLength] = useState(0)
  const [copied, setCopied] = useState(false)

  function salinNomorTiket(nomor: string) {
    navigator.clipboard.writeText(nomor)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tampilkan halaman sukses setelah berhasil kirim
  if (state?.success) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-green-500 h-2" />
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Pengaduan Berhasil Dikirim!
            </h2>
            <p className="text-gray-500 mb-6">
              Simpan nomor tiket berikut untuk melacak status pengaduan Anda.
            </p>

            {/* Nomor tiket */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Nomor Tiket Pengaduan</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold font-mono text-gray-900 tracking-wider">
                  {state.nomorTiket}
                </span>
                <button
                  onClick={() => salinNomorTiket(state.nomorTiket!)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Salin nomor tiket"
                >
                  <ClipboardCopy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">✓ Disalin!</p>
              )}
            </div>

            <div className="text-sm text-gray-500 bg-blue-50 rounded-lg p-3 mb-6 text-left">
              <Info className="w-4 h-4 text-blue-500 inline mr-1.5" />
              Pengaduan Anda akan ditinjau oleh pihak sekolah. Pantau perkembangan melalui halaman dasbor.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/kirim-pengaduan">
                  Kirim Pengaduan Lain
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/pengaduan/${state.pengaduanId}`}>
                  Lihat Detail
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Navigasi kembali */}
      <div className="mb-4">
        <Link
          href="/dasbor"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dasbor
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Formulir Pengaduan</CardTitle>
          <CardDescription>
            Sampaikan keluhan Anda dengan detail agar dapat segera ditangani
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error global */}
          {state && !state.success && state.message && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Terjadi Kesalahan</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Panduan */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Tips mengisi pengaduan yang baik:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                  <li>Judul singkat dan deskriptif</li>
                  <li>Deskripsikan masalah dengan jelas (lokasi, waktu, dampak)</li>
                  <li>Pilih kategori yang paling sesuai</li>
                </ul>
              </div>
            </div>
          </div>

          <form action={action} className="space-y-6">
            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-sm font-medium">
                Judul Pengaduan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                name="judul"
                placeholder="Contoh: Toilet lantai 2 rusak dan berbau tidak sedap"
                maxLength={200}
                className={state?.errors?.judul ? 'border-red-400' : ''}
              />
              {state?.errors?.judul ? (
                <p className="text-xs text-red-600">{state.errors.judul[0]}</p>
              ) : (
                <p className="text-xs text-gray-400">Minimal 10, maksimal 200 karakter</p>
              )}
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Kategori Layanan <span className="text-red-500">*</span>
              </Label>
              <input type="hidden" name="kategori" value={kategoriValue} />
              <Select
                onValueChange={setKategoriValue}
                value={kategoriValue}
              >
                <SelectTrigger className={state?.errors?.kategori ? 'border-red-400' : ''}>
                  <SelectValue placeholder="Pilih kategori pengaduan..." />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <span>{opt.label}</span>
                        <span className="text-gray-400 text-xs ml-2">— {opt.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.kategori && (
                <p className="text-xs text-red-600">{state.errors.kategori[0]}</p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deskripsi" className="text-sm font-medium">
                  Deskripsi Pengaduan <span className="text-red-500">*</span>
                </Label>
                <span className={`text-xs ${deskripsiLength < 30 ? 'text-gray-400' : 'text-green-600'}`}>
                  {deskripsiLength}/5000
                </span>
              </div>
              <Textarea
                id="deskripsi"
                name="deskripsi"
                placeholder="Jelaskan permasalahan secara detail: di mana lokasinya, kapan pertama kali terjadi, bagaimana dampaknya terhadap kegiatan belajar, dan solusi yang Anda harapkan..."
                rows={6}
                maxLength={5000}
                onChange={(e) => setDeskripsiLength(e.target.value.length)}
                className={`resize-none ${state?.errors?.deskripsi ? 'border-red-400' : ''}`}
              />
              {state?.errors?.deskripsi ? (
                <p className="text-xs text-red-600">{state.errors.deskripsi[0]}</p>
              ) : (
                <p className="text-xs text-gray-400">Minimal 30 karakter. Semakin detail, semakin mudah ditangani.</p>
              )}
            </div>

            <Separator />

            {/* Info sebelum kirim */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
              <p>
                <strong>Perhatian:</strong> Pastikan informasi yang Anda isi sudah benar sebelum mengirim.
                Pengaduan yang sudah dikirim tidak dapat diubah.
              </p>
            </div>

            <TombolKirim />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
