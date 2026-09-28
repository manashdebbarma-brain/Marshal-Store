"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Clock3,
  PackageCheck,
  CreditCard,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { findOrder, type StoredOrder } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "placed" | "processing" | "completed" | "cancelled";

export default function TrackOrderPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    if (!query.trim()) return;

    const result = findOrder(query);
    setOrder(result || null);
    setSearched(true);
  }

  // ✅ Live refresh when order status changes (e.g., admin updates)
  useEffect(() => {
    if (!order) return;

    const refresh = () => {
      const updated = findOrder(order.orderId);
      if (updated) setOrder(updated);
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("orders-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("orders-updated", refresh);
    };
  }, [order]);

  // Compute step completion based on order status
  const status: OrderStatus = (order?.status as OrderStatus) || "placed";
  const isCancelled = status === "cancelled";
  const isCompleted = status === "completed";
  const isProcessing = status === "processing" || isCompleted;
  const isPaid = status !== "placed" || true; // Payment is received once order is placed

  return (
    <main className="mx-auto w-full px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
          Order Tracking
        </p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter your Order ID or Player ID to check the current status of
          your order.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mt-8 max-w-2xl">
        <div className="glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearched(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="Enter Order ID or Player ID"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.01]"
          >
            Track Order
          </button>
        </div>
      </div>

      {/* Not Found */}
      {searched && !order && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
          <h2 className="font-bold text-red-300">Order Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            We could not find an order matching your search.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Make sure you entered the correct Order ID or Player ID.
          </p>
        </div>
      )}

      {/* Order Result */}
      {order && (
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="glass rounded-3xl p-6 md:p-8">
            {/* Header row */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Order ID
                </p>
                <p className="mt-1 font-mono text-lg font-black text-cyan-400">
                  {order.orderId}
                </p>
              </div>
              <div
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  isCancelled
                    ? "border-red-400/20 bg-red-400/10 text-red-400"
                    : isCompleted
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                    : "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                }`}
              >
                {isCancelled
                  ? "Cancelled"
                  : isCompleted
                  ? "Completed"
                  : status === "processing"
                  ? "Processing"
                  : "Order Placed"}
              </div>
            </div>

            {/* Product details */}
            <div className="grid gap-4 border-b border-white/10 py-6 md:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Product</p>
                <p className="mt-1 font-semibold">{order.productName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Package</p>
                <p className="mt-1 font-semibold">{order.packageName}</p>
              </div>
              {order.playerId && (
                <div>
                  <p className="text-xs text-slate-500">Player ID</p>
                  <p className="mt-1 font-semibold">{order.playerId}</p>
                </div>
              )}
              {order.serverId && (
                <div>
                  <p className="text-xs text-slate-500">Server ID</p>
                  <p className="mt-1 font-semibold">{order.serverId}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">Payment</p>
                <p className="mt-1 font-semibold">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Paid</p>
                <p className="mt-1 font-bold text-cyan-400">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-6">
              <h2 className="text-lg font-black">Order Progress</h2>

              <div className="mt-6 space-y-0">
                {/* Step 1 — Placed (always done) */}
                <TimelineStep
                  icon={<CheckCircle2 size={20} />}
                  title="Order Placed"
                  description="Your order has been successfully created."
                  active={true}
                  lineAfter={true}
                />

                {/* Step 2 — Payment */}
                <TimelineStep
                  icon={
                    isCancelled ? (
                      <XCircle size={19} />
                    ) : (
                      <CreditCard size={19} />
                    )
                  }
                  title={isCancelled ? "Cancelled" : "Payment Received"}
                  description={
                    isCancelled
                      ? "This order was cancelled."
                      : "Your payment has been successfully received."
                  }
                  active={!isCancelled}
                  danger={isCancelled}
                  lineAfter={true}
                />

                {/* Step 3 — Processing */}
                <TimelineStep
                  icon={<Clock3 size={19} />}
                  title="Processing Top-Up"
                  description="Your order is being processed and delivered."
                  active={isProcessing && !isCancelled}
                  lineAfter={true}
                />

                {/* Step 4 — Completed */}
                <TimelineStep
                  icon={<PackageCheck size={19} />}
                  title="Completed"
                  description="Your digital product has been delivered."
                  active={isCompleted && !isCancelled}
                  lineAfter={false}
                />
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            <ArrowLeft size={17} />
            Back to Store
          </button>
        </div>
      )}
    </main>
  );
}

/* =========================
   TIMELINE STEP COMPONENT
========================= */
function TimelineStep({
  icon,
  title,
  description,
  active,
  danger = false,
  lineAfter,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  danger?: boolean;
  lineAfter: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
            active
              ? danger
                ? "bg-red-500 text-white"
                : "bg-cyan-400 text-black"
              : "bg-white/5 text-slate-600"
          }`}
        >
          {icon}
        </div>
        {lineAfter && (
          <div
            className={`h-12 w-px transition ${
              active ? "bg-cyan-400/40" : "bg-white/10"
            }`}
          />
        )}
      </div>
      <div className={lineAfter ? "pb-8" : ""}>
        <h3
          className={`font-bold ${
            active ? "text-white" : "text-slate-500"
          }`}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}