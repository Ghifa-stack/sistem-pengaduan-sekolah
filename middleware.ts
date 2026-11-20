import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Rute publik (tidak perlu login)
  const publicRoutes = ['/masuk', '/daftar', '/lupa-sandi', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Redirect ke halaman masuk jika belum login dan mengakses halaman yang butuh login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/masuk', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Jika sudah login dan membuka halaman /masuk, /daftar, atau /lupa-sandi, arahkan ke dasbor masing-masing
  if (session && (pathname === '/masuk' || pathname === '/daftar' || pathname === '/lupa-sandi')) {
    if (session.user?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/dasbor', request.url))
    }
  }

  // Blokir akses non-admin ke halaman /admin
  if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dasbor', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
