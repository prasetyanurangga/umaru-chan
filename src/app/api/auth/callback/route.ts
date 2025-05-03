import { getBaseUrl } from '@/app/lib/getBaseUrl';
import { NextRequest, NextResponse } from 'next/server'

import cookie from 'cookie';

export async function GET(req: NextRequest, res: NextResponse) {
  const code = req.nextUrl.searchParams.get('code');

  const url =  `${getBaseUrl()}/api/auth/callback`;

  if (!code) {
    const redirectUrl = `${req.nextUrl.origin}/login`;
    const response = NextResponse.redirect(redirectUrl, 302);
    return response;
  }

  try {
    const res = await fetch("https://auth.monday.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.MONDAY_CLIENT_ID,
        client_secret: process.env.MONDAY_CLIENT_SECRET,
        redirect_uri: url,
      }),
    });

    const data = await res.json();
    
    const cookies = cookie.serialize('token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Pastikan hanya mengirimkan cookies melalui HTTPS di production
      sameSite: 'lax', // Proteksi CSRF
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // Token berlaku selama 7 hari
    });

    // Set cookie dan redirect ke halaman /home setelah login berhasil
    const redirectUrl = `${req.nextUrl.origin}/home`;
    const response = NextResponse.redirect(redirectUrl, 302);
    response.headers.set('Set-Cookie', cookies);

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "OAuth error", message: err.message }, { status: 500 });
  }
}
