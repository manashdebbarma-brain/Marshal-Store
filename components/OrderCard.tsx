"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, RefreshCw, Receipt, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/Toast";
import { addToCart } from "@/lib/storage";
import type { StoredOrder } from "@/lib/storage";

const STATUS_STYLES: Record<
  StoredOrder["status"],
  { label: string; className: string }
> = {
  placed: {
    label: "Placed",
    className: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  },
  received: {
    label: "Received",
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
  },
  processing: {
    label: "Processing",
    className: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  },
};

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrderCard({
  order,
  index,
}: {
  order: StoredOrder;
  index: number;
}) {
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.placed;

  function handleReorder() {
    addToCart({
      id: `${order.productSlug}-${order.orderId}`,
      productSlug: order.productSlug,
      productName: order.productName,
      packageId: order.orderId,
      packageName: order.packageName,
      amount: order.subtotal,
      quantity: 1,
    });

    toast(`${order.packageName} re-added to cart`, "success");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-cyan-400/30"
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-5">
        {/* Thumbnail */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
          <img
            src={`/games/${order.productSlug}.jpg`}
            alt={order.productName}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white/10">
            {order.productName.substring(0, 2)}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black">{order.productName}</h3>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            {order.packageName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Package size={12} />
              #{order.orderId}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo(order.timestamp)}
            </span>
            {order.playerId && (
              <span>Player: {order.playerId}</span>
            )}
          </div>
        </div>

        {/* Amount + Actions */}
        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="text-right">
            <p className="text-xs text-slate-500">Total paid</p>
            <p className="text-lg font-black text-cyan-400">
              {formatCurrency(order.total)}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
  href={`/transaction/${order.orderId}`}
  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold transition hover:bg-white/10"
>
  <Receipt size={13} />
  Receipt
</Link>

            <button
              onClick={handleReorder}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-400 transition hover:bg-cyan-400/20"
            >
              <RefreshCw size={13} />
              Reorder
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}