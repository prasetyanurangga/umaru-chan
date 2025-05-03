import { getBaseUrl } from '@/app/lib/getBaseUrl';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {

      const url =  req.nextUrl.origin
  return NextResponse.json({
    MONDAY_CLIENT_ID: process.env.MONDAY_CLIENT_ID,
    MONDAY_CLIENT_SECRET: process.env.MONDAY_CLIENT_SECRET,
    MONDAY_REDIRECT_URI: url,
  });
}
