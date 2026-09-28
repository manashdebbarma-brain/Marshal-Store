import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { gameSlug, playerId, serverId } = await req.json();

    if (!playerId || playerId.trim().length === 0) {
      return NextResponse.json(
        { error: "Player ID is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ALUU_API_KEY;
    const baseUrl = (process.env.ALUU_BASE_URL || "https://aluu.in").replace(/\/$/, "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "ALUU API key is missing on the server environment." },
        { status: 500 }
      );
    }

    // Map your game slug to what ALU API expects (e.g., "mlbb" for Mobile Legends)
    let gameCode = "mlbb";
    if (gameSlug && !gameSlug.includes("mobile-legends")) {
      gameCode = gameSlug;
    }

    // Construct the correct query parameters for ALU API Name Checker
    const params = new URLSearchParams({
      code: gameCode,
      characterId: playerId.trim(),
    });

    if (serverId && serverId.trim().length > 0) {
      params.append("server_code", serverId.trim());
    }

    const targetUrl = `${baseUrl}/api/check/game-check?${params.toString()}`;
    console.log("➡️ Sending GET request to ALU API:", targetUrl);

    // ALU API Name Checker uses GET with x-api-key header
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey,
      },
    });

    const rawText = await response.text();
    console.log("⬅️ Raw response text from ALU:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON. Response was HTML or text.");
      return NextResponse.json(
        { error: "Invalid response received from verification provider." },
        { status: 502 }
      );
    }

    if (response.ok && (data.username || data.nickname || data.player_name || data.name)) {
      const username = data.username || data.nickname || data.player_name || data.name;
      return NextResponse.json({ username });
    }

    return NextResponse.json(
      { error: data.message || data.error || "Invalid Player ID or Server ID." },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Verification Route Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to verification servers." },
      { status: 500 }
    );
  }
}