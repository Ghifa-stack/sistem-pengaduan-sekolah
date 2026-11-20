'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ClipboardList, LayoutDashboard, LogOut, User } from 'lucide-react'

interface NavbarLandingProps {
  sessionUser?: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
}

export function NavbarLanding({ sessionUser }: NavbarLandingProps) {
  const dasborUrl = sessionUser?.role === 'ADMIN' ? '/admin' : '/dasbor'

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">SiPengadu</span>
        </Link>

        <div className="flex items-center gap-2">
          {sessionUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Masuk sebagai <strong className="text-gray-800">{sessionUser.name}</strong> ({sessionUser.role})
              </span>
              <Button size="sm" asChild className="gap-1.5">
                <Link href={dasborUrl}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Buka Dasbor</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/masuk">Masuk</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/daftar">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
