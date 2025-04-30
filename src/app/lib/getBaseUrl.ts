// lib/getBaseUrl.ts

import { NextRequest } from "next/server";



export function getBaseUrl(request: NextRequest): string {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    return `${protocol}://${host}`;
}
