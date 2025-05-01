import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
   const awaitedParams = await params; // Tambahkan 'await' di sini
  const { boardId } = awaitedParams;


  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requestBody = await req.json();
  const {
    endpointUrl,
    method = 'GET',
    queryParams = {},
    body,
    bodyType = 'json',
    mapping,
  } = requestBody;

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

    return NextResponse.json({
      message: `Data dari ${endpointUrl} berhasil diproses dan diperbarui untuk Board ID ${boardId}.`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function processAndUpdateMonday(boardId: string, apiData: any, mapping: any, token: string) {
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

      itemsToCreate.push({
        itemName: itemData.name || 'New Item',
        columnValues: itemValues,
      });
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

      const res = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            boardId,
            itemName: item.itemName,
            columnValues: JSON.stringify(item.columnValues),
          },
        }),
      });

      const json = await res.json();
      if (json.errors) {
        console.error('Monday API error:', json.errors);
      }
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


