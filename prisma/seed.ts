import { PrismaClient, Role, KategoriPengaduan, StatusPengaduan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function generateNomorTiket(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `ADU-${year}${month}-${random}`
}

async function main() {
  console.log('🌱 Memulai seeding database...')

  // Hapus data lama
  await prisma.pesan.deleteMany()
  await prisma.statusLog.deleteMany()
  await prisma.pengaduan.deleteMany()
  await prisma.user.deleteMany()

  // ==========================================
  // BUAT USER
  // ==========================================
  const passwordAdmin = await bcrypt.hash('admin123', 12)
  const passwordSiswa = await bcrypt.hash('siswa123', 12)

  const admin = await prisma.user.create({
    data: {
      nama: 'Admin Sekolah',
      email: 'admin@sekolah.id',
      passwordHash: passwordAdmin,
      role: Role.ADMIN,
    },
  })

  const siswa1 = await prisma.user.create({
    data: {
      nama: 'Budi Santoso',
      email: 'budi@siswa.id',
      passwordHash: passwordSiswa,
      role: Role.PELAPOR,
    },
  })

  const siswa2 = await prisma.user.create({
    data: {
      nama: 'Siti Rahayu',
      email: 'siti@siswa.id',
      passwordHash: passwordSiswa,
      role: Role.PELAPOR,
    },
  })

  console.log('✅ User berhasil dibuat:', { admin: admin.email, siswa1: siswa1.email, siswa2: siswa2.email })

  // ==========================================
  // BUAT PENGADUAN CONTOH
  // ==========================================
  const pengaduan1 = await prisma.pengaduan.create({
    data: {
      nomorTiket: await generateNomorTiket(),
      judul: 'Toilet Lantai 2 Rusak dan Berbau',
      deskripsi: 'Toilet di lantai 2 gedung A sudah tidak berfungsi dengan baik selama 2 minggu. Kran air rusak dan menimbulkan bau tidak sedap yang mengganggu aktivitas belajar.',
      kategori: KategoriPengaduan.KEBERSIHAN,
      status: StatusPengaduan.DIPROSES,
      pelaporId: siswa1.id,
      petugasId: admin.id,
    },
  })

  const pengaduan2 = await prisma.pengaduan.create({
    data: {
      nomorTiket: await generateNomorTiket(),
      judul: 'Proyektor Kelas 10A Tidak Berfungsi',
      deskripsi: 'Proyektor di kelas 10A sudah mati total sejak 3 hari yang lalu. Hal ini sangat menghambat proses pembelajaran yang membutuhkan presentasi visual.',
      kategori: KategoriPengaduan.SARANA_PRASARANA,
      status: StatusPengaduan.BARU,
      pelaporId: siswa1.id,
    },
  })

  const pengaduan3 = await prisma.pengaduan.create({
    data: {
      nomorTiket: await generateNomorTiket(),
      judul: 'Proses Legalisir Surat Terlalu Lama',
      deskripsi: 'Saya sudah mengajukan legalisir ijazah 2 minggu yang lalu namun belum selesai. Padahal batas waktu pendaftaran beasiswa sudah dekat.',
      kategori: KategoriPengaduan.PELAYANAN_ADMINISTRASI,
      status: StatusPengaduan.SELESAI,
      pelaporId: siswa2.id,
    },
  })

  const pengaduan4 = await prisma.pengaduan.create({
    data: {
      nomorTiket: await generateNomorTiket(),
      judul: 'Lampu Koridor Mati Berpotensi Bahaya',
      deskripsi: 'Beberapa lampu di koridor belakang sudah mati lebih dari seminggu. Kondisi gelap ini berpotensi menyebabkan kecelakaan terutama saat jam pulang sekolah.',
      kategori: KategoriPengaduan.KEAMANAN,
      status: StatusPengaduan.BARU,
      pelaporId: siswa2.id,
    },
  })

  console.log('✅ Pengaduan berhasil dibuat')

  // ==========================================
  // BUAT STATUS LOG
  // ==========================================

  // Log untuk pengaduan1 (DIPROSES)
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan1.id,
      statusLama: null,
      statusBaru: StatusPengaduan.BARU,
      catatan: 'Pengaduan berhasil dikirim',
      userId: siswa1.id,
    },
  })
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan1.id,
      statusLama: StatusPengaduan.BARU,
      statusBaru: StatusPengaduan.DIPROSES,
      catatan: 'Tim kebersihan sudah dihubungi dan akan segera menangani masalah ini.',
      userId: admin.id,
    },
  })

  // Log untuk pengaduan2 (BARU)
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan2.id,
      statusLama: null,
      statusBaru: StatusPengaduan.BARU,
      catatan: 'Pengaduan berhasil dikirim',
      userId: siswa1.id,
    },
  })

  // Log untuk pengaduan3 (SELESAI)
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan3.id,
      statusLama: null,
      statusBaru: StatusPengaduan.BARU,
      catatan: 'Pengaduan berhasil dikirim',
      userId: siswa2.id,
    },
  })
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan3.id,
      statusLama: StatusPengaduan.BARU,
      statusBaru: StatusPengaduan.DIPROSES,
      catatan: 'Staf TU sedang memproses berkas legalisir.',
      userId: admin.id,
    },
  })
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan3.id,
      statusLama: StatusPengaduan.DIPROSES,
      statusBaru: StatusPengaduan.SELESAI,
      catatan: 'Legalisir sudah selesai dan dapat diambil di TU. Mohon maaf atas keterlambatan.',
      userId: admin.id,
    },
  })

  // Log untuk pengaduan4 (BARU)
  await prisma.statusLog.create({
    data: {
      pengaduanId: pengaduan4.id,
      statusLama: null,
      statusBaru: StatusPengaduan.BARU,
      catatan: 'Pengaduan berhasil dikirim',
      userId: siswa2.id,
    },
  })

  console.log('✅ Status log berhasil dibuat')

  // ==========================================
  // BUAT PESAN PERCAKAPAN (Thread Tanggapan)
  // ==========================================
  await prisma.pesan.create({
    data: {
      pengaduanId: pengaduan1.id,
      userId: admin.id,
      isi: 'Halo Budi, terima kasih atas laporannya. Tim sarpras dan kebersihan sudah dijadwalkan untuk memeriksa dan mengganti kran yang rusak siang ini.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 jam lalu
    },
  })

  await prisma.pesan.create({
    data: {
      pengaduanId: pengaduan1.id,
      userId: siswa1.id,
      isi: 'Baik Pak, terima kasih banyak atas respon cepatnya. Mohon sekalian diperiksa pintu bilik nomor 2 yang kuncinya macet ya Pak.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 menit lalu
    },
  })

  console.log('✅ Percakapan contoh berhasil dibuat')

  console.log('\n🎉 Seeding selesai!')
  console.log('\n📋 Akun untuk testing:')
  console.log('   Admin   : admin@sekolah.id / admin123')
  console.log('   Siswa 1 : budi@siswa.id / siswa123')
  console.log('   Siswa 2 : siti@siswa.id / siswa123')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
