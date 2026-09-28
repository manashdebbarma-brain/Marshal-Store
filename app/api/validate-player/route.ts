import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { playerId, serverId, gameSlug } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: "Player ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GAME_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key not configured in environment" },
        { status: 500 }
      );
    }

    // Map your local game slugs to ALU game codes (e.g., 'mobile-legends' -> 'mlbb')
    const gameCodeMap: Record<string, string> = {
      "mobile-legends": "mlbb",
      "free-fire": "freefire",
      "pubg-mobile": "pubgm",
    };

    const code = gameCodeMap[gameSlug] || gameSlug || "mlbb";

    // Query ALU API Name Checker endpoint
    const url = new URL("https://aluu.in/api/check/game-check");
    url.searchParams.append("code", code);
    url.searchParams.append("characterId", playerId);
    if (serverId) {
      url.searchParams.append("server_code", serverId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    const data = await response.json();

    if (data && data.username) {
      return NextResponse.json({
        success: true,
        username: data.username,
        region: data.region || "",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: data.message || "Player ID or Server ID not found",
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to connect to ID verification server" },
      { status: 500 }
    );
  }
}