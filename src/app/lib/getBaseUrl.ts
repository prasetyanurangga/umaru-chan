// lib/getBaseUrl.ts

import { NextRequest } from "next/server";



export function getBaseUrl(request: NextRequest): string {
    const cookie = request.cookies.get('base_url')?.value;
    return cookie || 'http://localhost:3000';
    // return "https://eb6e8d2cf9b4.apps-tunnel.monday.app"
}


