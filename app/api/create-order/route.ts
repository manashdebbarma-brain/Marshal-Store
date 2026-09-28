import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      action, 
      amount, 
      packageId, 
      playerId, 
      serverId, 
      gameSlug, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = body;

    // ==========================================
    // ACTION 1: VERIFY PAYMENT & DISPATCH TO ALUU
    // ==========================================
    if (action === "verify_and_fulfill") {
      const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
      }

      // Prepare ALUU Supplier Payload
      const aluuApiKey = process.env.ALUU_API_KEY;
      const aluuBaseUrl = (process.env.ALUU_BASE_URL || "https://aluu.in").replace(/\/$/, "");

      if (!aluuApiKey) {
        return NextResponse.json({ error: "ALUU API key missing on server." }, { status: 500 });
      }

      // Map game slug to provider code if necessary
      let gameCode = "mlbb";
      if (gameSlug && !gameSlug.includes("mobile-legends")) {
        gameCode = gameSlug;
      }

      const aluuPayload = {
        code: gameCode,
        characterId: playerId,
        server_code: serverId || "",
        package_id: packageId,
        ref_id: razorpay_order_id, // Use Razorpay order ID as unique tracking reference
      };

      console.log("➡️ Dispatching order to ALUU supplier:", aluuPayload);

      // Call ALUU Order Placement Endpoint (adjust endpoint path if your supplier docs differ)
      const aluuResponse = await fetch(`${aluuBaseUrl}/api/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-api-key": aluuApiKey,
        },
        body: JSON.stringify(aluuPayload),
      });

      const aluuText = await aluuResponse.text();
      let aluuData;
      try {
        aluuData = JSON.parse(aluuText);
      } catch (e) {
        console.error("❌ ALUU Order Response was not JSON:", aluuText);
        return NextResponse.json({ 
          success: true, 
          message: "Payment successful, order submitted to supplier queue.",
          orderReference: razorpay_order_id 
        });
      }

      if (aluuResponse.ok && (aluuData.success || aluuData.status === "success" || aluuData.order_id)) {
        console.log("✅ ALUU Order Successful:", aluuData);
        return NextResponse.json({
          success: true,
          message: "Order placed and fulfilled successfully by game servers!",
          orderReference: aluuData.order_id || razorpay_order_id,
        });
      } else {
        console.error("❌ ALUU Order Failed:", aluuData);
        return NextResponse.json({ 
          error: aluuData.message || "Payment received, but supplier fulfillment encountered an issue. Contact support." 
        }, { status: 400 });
      }
    }

    // ==========================================
    // ACTION 2: INITIALIZE RAZORPAY ORDER
    // ==========================================
    if (!amount || !playerId) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paisa
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { playerId, serverId: serverId || "", packageId },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Order Processing Error:", error);
    return NextResponse.json({ error: "Server error processing payment." }, { status: 500 });
  }
}