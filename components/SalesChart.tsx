"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface DayData {
  label: string; // e.g. "Mon"
  amount: number;
}

interface Props {
  data: DayData[];
}

export default function SalesChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const avg = total / Math.max(data.length, 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-black">Weekly Revenue</h3>
          <p className="mt-1 text-xs text-slate-500">
            Last 7 days · Avg {formatCurrency(avg)}/day
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Total
          </p>
          <p className="text-xl font-black text-cyan-400">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      <div className="flex h-40 items-end justify-between gap-2">
        {data.map((day, i) => {
          const heightPct = max > 0 ? (day.amount / max) * 100 : 0;
          const isToday =
            i === data.length - 1; // last item is today

          return (
            <div
              key={day.label}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-full w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                  className={`relative w-full rounded-t-lg transition ${
                    isToday
                      ? "bg-gradient-to-t from-cyan-500 to-cyan-300"
                      : "bg-gradient-to-t from-cyan-500/40 to-cyan-400/20 group-hover:from-cyan-500/60 group-hover:to-cyan-400/40"
                  }`}
                  style={{ minHeight: day.amount > 0 ? "4px" : "0" }}
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block">
                    {formatCurrency(day.amount)}
                  </div>
                </motion.div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isToday ? "text-cyan-400" : "text-slate-500"
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <p className="mt-4 text-center text-xs text-slate-600">
          No sales in the last 7 days
        </p>
      )}
    </div>
  );
}