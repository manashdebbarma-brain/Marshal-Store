"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { WalletTransaction } from "@/lib/storage";

interface Props {
  balance: number;
  transactions: WalletTransaction[];
  onAddMoney: () => void;
}

export default function BalanceCard({
  balance,
  transactions,
  onAddMoney,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const [display, setDisplay] = useState(0);

  // Animate the balance counter
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const startValue = display;
    let rafId: number;

    function animate(timestamp: number) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (balance - startValue) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplay(balance);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 md:p-8"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 text-black shadow-lg shadow-cyan-400/30">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Marshal Wallet
              </p>
              <p className="text-sm font-semibold text-slate-400">
                Available Balance
              </p>
            </div>
          </div>

          <button
            onClick={() => setHidden(!hidden)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={hidden ? "Show balance" : "Hide balance"}
          >
            {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>

        {/* Big balance */}
        <div className="mt-6">
          <p className="text-4xl font-black tracking-tight md:text-5xl">
            {hidden ? (
              <span className="text-slate-600">₹ • • • •</span>
            ) : (
              <>
                <span className="text-slate-400">₹</span>
                <span className="ml-1">
                  {display.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Total Added
              </p>
              <p className="text-xs font-black text-emerald-400">
                {formatCurrency(totalCredit)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2">
            <TrendingDown size={14} className="text-red-400" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Total Spent
              </p>
              <p className="text-xs font-black text-red-400">
                {formatCurrency(totalDebit)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onAddMoney}
            className="group flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-cyan-300"
          >
            <Plus
              size={16}
              className="transition group-hover:rotate-90"
            />
            Add Money
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
            <Sparkles size={13} className="text-cyan-400" />
            <span className="font-semibold">
              Use wallet for faster checkout
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}