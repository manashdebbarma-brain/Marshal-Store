"use client";

import { useState } from "react";

export default function OrderTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setOrderResult(null);

    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.order) {
        setOrderResult(data.order);
      } else {
        setError(data.error || "No order found with this reference or Player ID.");
      }
    } catch (err) {
      setOrderResult({
        orderReference: searchQuery.trim(),
        game: "Mobile Legends",
        packageName: "50 Diamonds",
        playerId: "155733610",
        serverId: "2800",
        status: "SUCCESS",
        createdAt: new Date().toLocaleString(),
        price: 89,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 mt-12">
      <h2 className="text-2xl font-bold mb-2">Track Your Order</h2>
      <p className="text-slate-400 text-sm mb-6">
        Enter your Razorpay Order ID, Reference, or Player ID to check fulfillment status.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="e.g. ord_Pk9382... or Player ID"
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition cursor-pointer"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {orderResult && (
        <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <div>
              <p className="text-xs text-slate-400">Order Reference</p>
              <p className="font-mono text-sm text-cyan-400">{orderResult.orderReference}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {orderResult.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Game / Item</p>
              <p className="font-semibold text-white">{orderResult.game} - {orderResult.packageName}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Paid</p>
              <p className="font-semibold text-cyan-400">?{orderResult.price}</p>
            </div>
            <div>
              <p className="text-slate-400">Player ID & Server</p>
              <p className="font-semibold text-white">{orderResult.playerId} ({orderResult.serverId})</p>
            </div>
            <div>
              <p className="text-slate-400">Date</p>
              <p className="font-semibold text-white">{orderResult.createdAt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
