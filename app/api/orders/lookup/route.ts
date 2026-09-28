import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Please enter an order ID or Player ID." }, { status: 400 });
    }

    // Replace this mock response with your database query when ready
    const mockOrder = {
      orderReference: query.toUpperCase(),
      game: "Mobile Legends: Bang Bang",
      packageName: "250 + 25 Bonus Diamonds",
      playerId: "155733610",
      serverId: "2800",
      status: "SUCCESS",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: 420,
    };

    return NextResponse.json({ order: mockOrder });
  } catch (error) {
    return NextResponse.json({ error: "Failed to look up order details." }, { status: 500 });
  }
}
