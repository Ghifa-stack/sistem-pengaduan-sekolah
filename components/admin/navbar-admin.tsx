'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, LogOut, Home, BarChart3, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarAdminProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function NavbarAdmin({ user }: NavbarAdminProps) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/admin', label: 'Ringkasan Prioritas', icon: BarChart3, exact: true },
    { href: '/admin/pengaduan', label: 'Kelola Pengaduan', icon: Inbox, exact: false },
  ]

  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-2xs">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>SiPengadu</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                Admin
              </span>
            </div>
          </Link>

          {/* Navigasi Utama Admin */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User profile & Action */}
        <div className="flex items-center gap-2">
          {/* Quick links for mobile */}
          <div className="flex md:hidden items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="p-2">
              <Link href="/admin" title="Ringkasan">
                <BarChart3 className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="p-2">
              <Link href="/admin/pengaduan" title="Pengaduan">
                <Inbox className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-gray-600 hidden sm:flex">
            <Link href="/">
              <Home className="w-4 h-4" />
              <span>Halaman Depan</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</span>
            <span className="text-[10px] text-gray-400">{user.email}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ml-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
