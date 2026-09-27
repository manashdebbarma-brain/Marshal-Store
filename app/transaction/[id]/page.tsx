"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Printer,
  Share2,
  Wallet,
  XCircle,
} from "lucide-react";

import { getOrders, type StoredOrder } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<
  StoredOrder["status"],
  { label: string; className: string; icon: any }
> = {
  placed: {
    label: "Order Placed",
    className: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
    icon: Clock,
  },
  received: {
    label: "Order Received",
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    className: "border-blue-400/30 bg-blue-400/10 text-blue-400",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-400",
    icon: XCircle,
  },
};

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = getOrders();
    const found = all.find((o) => o.orderId === orderId);
    setOrder(found || null);
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-slate-500">Loading receipt...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-500/10 text-red-400">
          <Package size={32} />
        </div>
        <h1 className="mt-4 text-2xl font-black">Order not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
        <Link
          href="/transaction"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
        >
          <ArrowLeft size={16} />
          Back to My Orders
        </Link>
      </main>
    );
  }

  const status = STATUS_STYLES[order.status] || STATUS_STYLES.placed;
  const StatusIcon = status.icon;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link
        href="/transaction"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to My Orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]"
      >
        {/* HEADER */}
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-cyan-500/20 via-cyan-500/5 to-transparent p-6 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Order Receipt
              </p>
              <h1 className="mt-2 text-2xl font-black md:text-3xl">
                #{order.orderId}
              </h1>
              <p className="mt-2 text-xs text-slate-400">
                Placed on{" "}
                {new Date(order.timestamp).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider ${status.className}`}
            >
              <StatusIcon size={14} />
              {status.label}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
              <img
                src={`/games/${order.productSlug}.jpg`}
                alt={order.productName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display =
                    "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white/10">
                {order.productName.substring(0, 2)}
              </div>
            </div>
            <div>
              <p className="font-black">{order.productName}</p>
              <p className="mt-1 text-sm text-slate-400">
                {order.packageName}
              </p>
            </div>
          </div>

          {(order.playerId || order.serverId) && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
                Account Details
              </h2>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
                {order.playerId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Player ID</span>
                    <span className="font-mono font-bold">
                      {order.playerId}
                    </span>
                  </div>
                )}
                {order.serverId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Server ID</span>
                    <span className="font-mono font-bold">
                      {order.serverId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
              Payment Summary
            </h2>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Fee</span>
                <span>{formatCurrency(order.processingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3">
                <span className="font-bold">Total Paid</span>
                <span className="text-xl font-black text-cyan-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Wallet size={14} />
                  Payment Method
                </span>
                <span className="font-bold">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
              Order Timeline
            </h2>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              {[
                { label: "Order placed", done: true },
                { label: "Payment confirmed", done: true },
                {
                  label: "Processing",
                  done:
                    order.status === "processing" ||
                    order.status === "completed" ||
                    order.status === "received",
                },
                {
                  label: "Delivered",
                  done: order.status === "completed",
                },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                      step.done
                        ? "bg-emerald-500 text-black"
                        : "bg-white/10 text-slate-500"
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      step.done ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
            >
              <Printer size={16} />
              Print
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: `Order #${order.orderId}`,
                      text: `${order.productName} — ${order.packageName}`,
                      url: window.location.href,
                    })
                    .catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard");
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
            >
              <Share2 size={16} />
              Share
            </button>

            <Link
              href="/"
              className="ml-auto flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-black text-black transition hover:scale-[1.02]"
            >
              Continue Shopping
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Thank you for shopping at Marshal Store 🎮
          </p>
        </div>
      </motion.div>
    </main>
  );
}