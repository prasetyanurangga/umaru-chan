import { getBaseUrl } from '@/app/lib/getBaseUrl';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.MONDAY_CLIENT_ID!;
  const rawUrl = getBaseUrl();
  const redirectUri = encodeURIComponent(rawUrl);
  
  const url = `https://auth.monday.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;

  return NextResponse.redirect(url, 302)
}
