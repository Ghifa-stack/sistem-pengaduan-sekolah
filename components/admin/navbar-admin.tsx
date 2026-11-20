'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, LogOut, Home } from 'lucide-react'

interface NavbarAdminProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function NavbarAdmin({ user }: NavbarAdminProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-2xs">
      <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>SiPengadu <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium ml-1">Admin</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-gray-600">
            <Link href="/">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Halaman Utama</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

          <span className="text-xs text-gray-600 hidden md:inline">
            {user.name} ({user.email})
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
