// lib/getBaseUrl.ts




export function getBaseUrl(): string {
    const baseUrl = process.env.MONDAY_REDIRECT_URL;
    var res = baseUrl || 'http://localhost:3000';
    return `${res}/api/auth/callback`;
    // return "https://eb6e8d2cf9b4.apps-tunnel.monday.app"
}


