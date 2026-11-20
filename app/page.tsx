import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NavbarLanding } from '@/components/navbar-landing'
import {
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Interaktif */}
      <NavbarLanding sessionUser={session?.user} />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <ShieldCheck className="w-4 h-4" />
          Layanan Pengaduan Resmi Sekolah
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Suaramu Penting,<br />
          <span className="text-blue-600">Kami Dengarkan</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Sampaikan keluhan tentang layanan sekolah secara terstruktur.
          Pantau perkembangan penanganan secara transparan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/daftar">
              Kirim Pengaduan Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/masuk">Lacak Pengaduan Saya</Link>
          </Button>
        </div>
      </section>

      {/* Fitur */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Bagaimana Cara Kerjanya?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ClipboardList,
              color: 'blue',
              step: '01',
              title: 'Kirim Pengaduan',
              desc: 'Isi formulir pengaduan dengan judul, deskripsi lengkap, dan pilih kategori layanan yang sesuai.',
            },
            {
              icon: MessageSquare,
              color: 'indigo',
              step: '02',
              title: 'Pantau Status',
              desc: 'Lacak perkembangan pengaduan Anda secara real-time. Terima tanggapan resmi dari pihak sekolah.',
            },
            {
              icon: BarChart3,
              color: 'green',
              step: '03',
              title: 'Masalah Teratasi',
              desc: 'Setelah pengaduan selesai ditangani, Anda dapat menandai pengaduan sebagai selesai.',
            },
          ].map((item) => (
            <Card key={item.step} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <div className="absolute top-4 right-4 text-5xl font-bold text-gray-50 select-none">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Kategori */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Kategori Pengaduan
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Sarana & Prasarana', emoji: '🏗️' },
            { label: 'Akademik', emoji: '📚' },
            { label: 'Kebersihan', emoji: '🧹' },
            { label: 'Keamanan', emoji: '🔒' },
            { label: 'Administrasi', emoji: '📋' },
            { label: 'Lainnya', emoji: '💬' },
          ].map((k) => (
            <div
              key={k.label}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <span className="text-2xl">{k.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{k.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-10 text-center text-white">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Mulai Buat Akun Sekarang</h2>
          <p className="text-blue-100 mb-6">
            Daftar gratis dan kirimkan pengaduan pertama Anda dalam hitungan menit.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/daftar">Daftar Gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 Sistem Layanan Pengaduan Sekolah · Dibuat dengan ❤️ untuk kemajuan pendidikan</p>
        </div>
      </footer>
    </div>
  )
}
