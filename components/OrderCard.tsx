"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, ExternalLink, XCircle } from "lucide-react";

import { type StoredOrder } from "@/lib/storage";
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

interface OrderCardProps {
  order: StoredOrder;
  index?: number;
}

export default function OrderCard({ order, index = 0 }: OrderCardProps) {
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.placed;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f172a] p-5 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-800">
          <img
            src={`/games/${order.productSlug}.jpg`}
            alt={order.productName}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div>
          <p className="font-bold">{order.productName}</p>
          <p className="text-xs text-slate-400">{order.packageName}</p>
          <p className="mt-1 text-xs text-slate-500">ID: #{order.orderId}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
        <div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${status.className}`}
          >
            <StatusIcon size={12} />
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
          View
          <ExternalLink size={14} />
        </Link>
      </div>
    </motion.div>
  );
}