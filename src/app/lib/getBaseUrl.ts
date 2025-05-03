// lib/getBaseUrl.ts

import { NextRequest } from "next/server";



export function getBaseUrl(request: NextRequest): string {
    const cookie = request.nextUrl.origin
    var res = cookie || 'http://localhost:3000';
    return `${res}/api/auth/callback`;
    // return "https://eb6e8d2cf9b4.apps-tunnel.monday.app"
}


