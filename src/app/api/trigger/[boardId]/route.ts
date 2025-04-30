import { NextRequest, NextResponse } from 'next/server'
import { configurations } from '@/app/lib/configuration'
import axios from 'axios'
import mondaySdk from 'monday-sdk-js'

export async function POST(req: NextRequest, { params }: { params: { boardId: string } }) {
  const boardId = params.boardId;
  const config = configurations[boardId];

  if (!config) {
    return NextResponse.json({ error: `Tidak ada konfigurasi untuk Board ID ${boardId}.` }, { status: 404 });
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { endpointUrl, method, params: queryParams, body, bodyType, mapping } = config;

  try {
    const headers: any = {};
    if (body && bodyType === 'json') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios.request({
      method,
      url: endpointUrl,
      params: queryParams,
      headers,
      data: bodyType === 'json' ? body : bodyType === 'raw' ? body : undefined,
    });

    await processAndUpdateMonday(boardId, response.data, mapping, token);

    return NextResponse.json({ message: `Data dari ${endpointUrl} berhasil diproses dan diperbarui untuk Board ID ${boardId}.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function processAndUpdateMonday(boardId: string, apiData: any, mapping: any, token: string) {
  const monday = mondaySdk();
  monday.setToken(token);

  const itemsToCreate: any[] = [];

  if (Array.isArray(apiData)) {
    for (const itemData of apiData) {
      const itemValues: Record<string, any> = {};
      for (const mondayColumnId in mapping) {
        const apiPath = mapping[mondayColumnId];
        try {
          const value = getNestedValue(itemData, apiPath);
          if (value !== undefined && value !== null) {
            itemValues[mondayColumnId] = String(value);
          }
        } catch (_) {}
      }
      itemsToCreate.push({ itemName: itemData.name || 'New Item', columnValues: itemValues });
    }

    for (const item of itemsToCreate) {
      const mutation = `
        mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
          create_item (
            board_id: $boardId,
            item_name: $itemName,
            column_values: $columnValues
          ) {
            id
          }
        }
      `;
      await monday.api(mutation, {
        variables: {
          boardId,
          itemName: item.itemName,
          columnValues: JSON.stringify(item.columnValues),
        },
      });
    }
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, key) => {
    const match = key.match(/([^\[]+)\[(\d+)\]/);
    if (match) {
      const prop = match[1];
      const index = parseInt(match[2], 10);
      return o?.[prop]?.[index];
    }
    return o?.[key];
  }, obj);
}
