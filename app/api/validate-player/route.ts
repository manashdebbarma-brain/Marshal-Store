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
    const apiSecret = process.env.GAME_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "API credentials missing from environment" },
        { status: 500 }
      );
    }

    // Replace the URL with your provider's specific player validation endpoint
    const response = await fetch("https://api.aluu.id/v1/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        "X-Api-Secret": apiSecret,
      },
      body: JSON.stringify({
        game: gameSlug,
        user_id: playerId,
        zone_id: serverId || "",
      }),
    });

    const data = await response.json();

    if (data && (data.username || data.nickname || data.data?.username)) {
      return NextResponse.json({
        success: true,
        username: data.username || data.nickname || data.data?.username,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: data.message || "Player ID / Server ID not found",
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to connect to verification service" },
      { status: 500 }
    );
  }
}