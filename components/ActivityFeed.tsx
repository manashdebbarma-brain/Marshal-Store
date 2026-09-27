"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  CheckCircle2,
  Clock3,
  IndianRupee,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ActivityItem {
  id: string;
  productName: string;
  packageName: string;
  total: number;
  timestamp: string;
  status?: string;
}

interface Props {
  orders: ActivityItem[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-slate-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black">Recent Activity</h3>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">
          Live
        </span>
      </div>

      <div className="space-y-1">
        {orders.slice(0, 8).map((order, i) => {
          const status = order.status || "placed";
          const isCompleted = status === "completed";

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-start gap-4 rounded-xl p-3 transition hover:bg-white/[0.03]"
            >
              {/* Icon */}
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  isCompleted
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-cyan-400/10 text-cyan-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <ShoppingBag size={17} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {order.productName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {order.packageName} · {timeAgo(order.timestamp)}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-sm font-black text-cyan-400">
                  +{formatCurrency(order.total)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {orders.length > 8 && (
        <p className="mt-4 text-center text-xs text-slate-600">
          + {orders.length - 8} more order{orders.length - 8 === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}