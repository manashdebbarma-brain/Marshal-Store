import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { playerId, gameCode, serverCode } = await req.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const baseUrl = process.env.ALUU_BASE_URL || 'https://aluu.in';
    const aluuUrl = `${baseUrl}/api/check/game-check?code=${gameCode || 'bgmi'}&characterId=${playerId}${serverCode ? `&server_code=${serverCode}` : ''}`;

    const response = await fetch(aluuUrl, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.ALUU_API_KEY || '',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to verify player' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Player verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}