import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = `
    query {
      boards {
        id
        name
        columns {
          id
          title
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error('Monday API errors:', json.errors);
      return NextResponse.json({ errors: json.errors }, { status: 500 });
    }

    return NextResponse.json({ data: json.data }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching boards and columns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}