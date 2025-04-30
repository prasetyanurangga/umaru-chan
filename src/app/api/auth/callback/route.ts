import { getBaseUrl } from '@/app/lib/getBaseUrl';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  const url =  getBaseUrl(req);

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
    return NextResponse.json({ access_token: data.access_token });
  } catch (err: any) {
    return NextResponse.json({ error: "OAuth error", message: err.message }, { status: 500 });
  }
}
