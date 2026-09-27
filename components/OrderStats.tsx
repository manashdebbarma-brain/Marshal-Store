"use client";

import { motion } from "framer-motion";
import { ShoppingBag, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { StoredOrder } from "@/lib/storage";

export default function OrderStats({ orders }: { orders: StoredOrder[] }) {
  const total = orders.length;
  const spent = orders.reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter(
    (o) => o.status === "placed" || o.status === "processing"
  ).length;
  const completed = orders.filter((o) => o.status === "completed").length;

  const stats = [
    {
      label: "Total Orders",
      value: String(total),
      icon: ShoppingBag,
      gradient: "from-cyan-500 to-teal-400",
    },
    {
      label: "Total Spent",
      value: formatCurrency(spent),
      icon: IndianRupee,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Pending",
      value: String(pending),
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      label: "Completed",
      value: String(completed),
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div
            className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-black`}
          >
            <s.icon size={18} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {s.label}
          </p>
          <p className="mt-1 text-xl font-black">{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}