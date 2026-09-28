import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // ─────────────────────────────────────────────
    // 1. Sanitize base URL
    // ─────────────────────────────────────────────
    const rawBaseUrl = process.env.ALUU_BASE_URL || 'https://aluu.in';
    const baseUrl = rawBaseUrl
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[\[\]"']/g, '')
      .trim();

    // ─────────────────────────────────────────────
    // 2. Get API key from env
    // ─────────────────────────────────────────────
    const apiKey = process.env.ALUU_API_KEY;
    if (!apiKey) {
      console.error('❌ ALUU_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────
    // 3. Parse request body
    // ─────────────────────────────────────────────
    const { playerId, gameCode, serverCode } = await req.json();

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const game = (gameCode || 'mlbb').toLowerCase();
    const requiresServerCode = game === 'mlbb' || game === 'mobile-legends';

    if (requiresServerCode && !serverCode) {
      return NextResponse.json(
        { error: 'Zone ID is required for Mobile Legends' },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // 4. Build URL
    // ─────────────────────────────────────────────
    let aluuUrl = `${baseUrl}/api/check/game-check?code=${game}&characterId=${playerId}`;
    if (requiresServerCode && serverCode) {
      aluuUrl += `&server_code=${serverCode}`;
    }

    console.log('🔗 Aluu verify URL:', aluuUrl);

    // ─────────────────────────────────────────────
    // 5. Call Aluu with API key header
    // ─────────────────────────────────────────────
    const res = await fetch(aluuUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // 👇 Try these header names — uncomment the one that works
        'x-api-key': apiKey,
        // 'Authorization': `Bearer ${apiKey}`,
        // 'api-key': apiKey,
      },
      cache: 'no-store',
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('❌ Non-JSON response:', text);
      return NextResponse.json(
        { error: 'Invalid response from game server' },
        { status: 502 }
      );
    }

    console.log('📥 Aluu response:', data);

    if (!res.ok || data?.success === false) {
      return NextResponse.json(
        { error: data?.message || 'Player lookup failed' },
        { status: 400 }
      );
    }

    const username =
      data?.username ||
      data?.name ||
      data?.player_name ||
      data?.data?.username ||
      data?.data?.name ||
      null;

    if (!username) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      username,
      playerId,
      serverCode: serverCode || null,
      game,
    });
  } catch (err: any) {
    console.error('❌ Verify error:', err);
    return NextResponse.json(
      { error: err?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}