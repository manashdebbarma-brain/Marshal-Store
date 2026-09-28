"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const GAME_PACKAGES: Record<string, Array<{ id: string; name: string; diamonds: string; bonus?: string; price: number }>> = {
  "mobile-legends": [
    { id: "ml_50", name: "50 Diamonds", diamonds: "50", bonus: "+5", price: 89 },
    { id: "ml_150", name: "150 Diamonds", diamonds: "150", bonus: "+15", price: 260 },
    { id: "ml_250", name: "250 Diamonds", diamonds: "250", bonus: "+25", price: 420 },
    { id: "ml_pass", name: "Weekly Diamond Pass", diamonds: "Pass", bonus: "210 Total", price: 160 },
    { id: "ml_500", name: "500 Diamonds", diamonds: "500", bonus: "+65", price: 840 },
    { id: "ml_1000", name: "1000 Diamonds", diamonds: "1000", bonus: "+155", price: 1680 },
  ],
};

export default function TopUpPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "mobile-legends";

  const packages = GAME_PACKAGES[slug] || GAME_PACKAGES["mobile-legends"];
  const [selectedPkg, setSelectedPkg] = useState(packages[0]);

  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const cleanPlayerId = playerId.trim();
    const cleanServerId = serverId.trim();

    if (!cleanPlayerId || cleanPlayerId.length < 4) {
      setVerifiedName(null);
      setVerifyError("");
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    setVerifyError("");
    setVerifiedName(null);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/verify-player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameSlug: slug, playerId: cleanPlayerId, serverId: cleanServerId }),
        });

        const data = await response.json();
        if (response.ok && data.username) {
          setVerifiedName(data.username);
        } else {
          setVerifyError(data.error || "Player ID or Server ID not found.");
        }
      } catch (err) {
        setVerifyError("Verification server unreachable.");
      } finally {
        setIsVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [playerId, serverId, slug]);

  const handleCheckout = async () => {
    if (!verifiedName) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPkg.price,
          packageId: selectedPkg.id,
          playerId: playerId.trim(),
          serverId: serverId.trim(),
          gameSlug: slug,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to initialize payment.");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MarshalStore",
        description: `${selectedPkg.name} for ${verifiedName}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify_and_fulfill",
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              playerId: playerId.trim(),
              serverId: serverId.trim(),
              packageId: selectedPkg.id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            setSuccessMessage(`Top-up successful! Order Ref: ${verifyData.orderReference}`);
          } else {
            alert(verifyData.error || "Payment verification failed.");
          }
        },
        prefill: { name: verifiedName },
        theme: { color: "#06b6d4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Checkout error.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 mt-10 space-y-8">
      {/* Account Details Step */}
      <div>
        <h2 className="text-xl font-bold mb-1">1. Enter Account Details</h2>
        <p className="text-slate-400 text-xs mb-4">In-game username will automatically verify.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Player ID (e.g. 155733610)"
            className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
          />
          <input
            type="text"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            placeholder="Zone/Server ID (e.g. 2800)"
            className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        {isVerifying && <p className="text-cyan-400 text-xs mt-2 animate-pulse">Verifying player ID...</p>}
        {verifiedName && (
          <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
            <span>✓</span> Account Verified: <strong className="text-white">{verifiedName}</strong>
          </div>
        )}
        {verifyError && !isVerifying && (
          <p className="mt-2 text-red-400 text-xs">{verifyError}</p>
        )}
      </div>

      {/* Package Selection Step */}
      <div>
        <h2 className="text-xl font-bold mb-1">2. Select Recharge Amount</h2>
        <p className="text-slate-400 text-xs mb-4">Choose your preferred diamond pack.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedPkg.id === pkg.id
                  ? "bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-500"
                  : "bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-300"
              }`}
            >
              <div>
                <p className="font-bold text-sm text-white">{pkg.name}</p>
                {pkg.bonus && <span className="text-xs text-cyan-400 font-medium">{pkg.bonus}</span>}
              </div>
              <p className="mt-3 font-extrabold text-cyan-400 text-base">₹{pkg.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Checkout Bar */}
      {successMessage ? (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-center">
          <p className="font-bold">{successMessage}</p>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Selected Option</p>
            <p className="font-bold text-white">{selectedPkg.name} — <span className="text-cyan-400">₹{selectedPkg.price}</span></p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!verifiedName || isProcessing}
            className={`px-8 py-3 rounded-xl font-semibold transition ${
              verifiedName && !isProcessing
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Opening..." : `Pay ₹{selectedPkg.price}`}
          </button>
        </div>
      )}
    </div>
  );
}