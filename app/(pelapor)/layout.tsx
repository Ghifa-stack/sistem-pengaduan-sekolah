import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { NavbarPelapor } from '@/components/pelapor/navbar-pelapor'

export default async function LayoutPelapor({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect('/masuk')
  if (session.user.role !== 'PELAPOR') redirect('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPelapor user={session.user} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
