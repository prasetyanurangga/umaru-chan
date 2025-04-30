import { NextRequest, NextResponse } from 'next/server'
import { configurations } from '@/app/lib/configuration'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boardId, endpointUrl, method = 'GET', params = {}, body: requestBody, bodyType = 'json', mapping = {} } = body;

    if (!boardId || !endpointUrl || !mapping) {
      return NextResponse.json({ error: "Board ID, Endpoint URL, dan Mapping harus disediakan." }, { status: 400 });
    }

    configurations[boardId] = {
      endpointUrl,
      method: method.toUpperCase(),
      params,
      body: requestBody,
      bodyType: bodyType.toLowerCase(),
      mapping
    };

    return NextResponse.json({ message: `Konfigurasi untuk Board ID ${boardId} berhasil disimpan.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
