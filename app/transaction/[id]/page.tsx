"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink, Package } from "lucide-react";

import { getOrders, type StoredOrder } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<
  StoredOrder["status"],
  { label: string; className: string }
> = {
  placed: {
    label: "Order Placed",
    className: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  },
  received: {
    label: "Order Received",
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
  cancelled: {
    label: "Cancelled",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-400",
  },
};

export default function TransactionsPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(getOrders());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-slate-500">Loading your transactions...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Store
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black md:text-4xl">My Orders</h1>
        <p className="mt-2 text-sm text-slate-400">
          View and track your previous purchase receipts and top-ups.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 text-slate-400">
            <Package size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold">No transactions found</h2>
          <p className="mt-1 text-sm text-slate-500">
            You haven't placed any orders yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_STYLES[order.status] || STATUS_STYLES.placed;
            return (
              <div
                key={order.orderId}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f172a] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src={`/games/${order.productSlug}.jpg`}
                      alt={order.productName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold">{order.productName}</p>
                    <p className="text-xs text-slate-400">
                      {order.packageName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      ID: #{order.orderId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
                  <div>
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <p className="mt-1 font-mono text-sm font-bold text-cyan-400">
                      {formatCurrency(order.total)}
                    </p>
                  </div>

                  <Link
                    href={`/transaction/${order.orderId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold transition hover:bg-white/10"
                  >
                    Receipt
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}