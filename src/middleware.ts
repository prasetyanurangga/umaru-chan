// /app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token'); // Cek token di cookie
  console.log(`${req.nextUrl.origin}`)

  console.log('Token:', token, req.nextUrl.pathname); // Debugging: tampilkan token di console

  // Jika token ada dan halaman yang diminta adalah halaman login ("/"), redirect ke /home
  if (token && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // Jika tidak ada token dan halaman yang diminta bukan login, redirect ke halaman login
  if (!token && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', req.url));
  }

//   return NextResponse.next(); // Lanjutkan ke halaman yang diminta
}

export const config = {
  matcher: ['/home', '/dashboard', '/profile', '/'], // Halaman yang ingin dilindungi atau diarahkan
};
