"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wallet,
  Plus,
  Check,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (amount: number) => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export default function AddMoneyModal({ open, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* Reset on close */
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelected(null);
        setCustomAmount("");
        setLoading(false);
        setSuccess(false);
      }, 200);
    }
  }, [open]);

  /* Escape key to close */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, loading]);

  // ✅ FIXED — parentheses around the OR expression
  const finalAmount = selected ?? (Number(customAmount) || 0);

  /* Eligible for bonus? ₹1000+ gets 5% bonus */
  const bonus = finalAmount >= 1000 ? Math.round(finalAmount * 0.05) : 0;
  const totalCredit = finalAmount + bonus;

  function handleAdd() {
    if (finalAmount <= 0) {
      toast("Enter a valid amount", "error");
      return;
    }
    if (finalAmount > 100000) {
      toast("Maximum single top-up is ₹1,00,000", "error");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      onAdd(finalAmount);

      // If there's a bonus, add it separately with a distinct label
      if (bonus > 0) {
        onAdd(bonus);
      }

      setLoading(false);
      setSuccess(true);

      toast(
        bonus > 0
          ? `Added ${formatCurrency(
              finalAmount
            )} + ${formatCurrency(bonus)} bonus!`
          : `Added ${formatCurrency(finalAmount)} to wallet`,
        "success"
      );

      setTimeout(() => {
        onClose();
      }, 1200);
    }, 800);
  }

  function handleCustomChange(value: string) {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 6);
    setCustomAmount(cleaned);
    setSelected(null);
  }

  function handleQuickSelect(amount: number) {
    setSelected(amount);
    setCustomAmount("");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl md:p-8"
          >
            {/* Success overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 grid place-items-center bg-[#0f172a]"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="grid h-20 w-20 place-items-center rounded-full bg-emerald-400/20 text-emerald-400"
                  >
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 text-black shadow-lg shadow-cyan-400/30">
                <Wallet size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black">Add Money</h2>
                <p className="text-xs text-slate-500">
                  Top up your wallet instantly
                </p>
              </div>
            </div>

            {/* Quick amounts */}
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              Quick amounts
            </p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((amount) => {
                const isSelected = selected === amount;
                return (
                  <button
                    key={amount}
                    onClick={() => handleQuickSelect(amount)}
                    disabled={loading}
                    className={`relative rounded-xl border py-3 text-sm font-black transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                    } disabled:opacity-50`}
                  >
                    ₹{amount}
                    {amount >= 1000 && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[8px] font-black text-black">
                        +5%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom amount */}
            <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-slate-500">
              Or enter custom amount
            </p>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 focus-within:border-cyan-400/50">
              <span className="border-r border-white/10 px-4 py-3.5 text-lg font-black text-slate-400">
                ₹
              </span>
              <input
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Enter amount"
                inputMode="numeric"
                disabled={loading}
                className="w-full bg-transparent px-3 py-3.5 text-lg font-black text-white outline-none placeholder:text-slate-600"
              />
            </div>

            {/* Bonus preview */}
            {bonus > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-3 text-xs font-bold text-yellow-400"
              >
                <Sparkles size={14} />
                <span>
                  You&apos;ll get {formatCurrency(bonus)} bonus! Total
                  credit: {formatCurrency(totalCredit)}
                </span>
              </motion.div>
            )}

            {/* Demo banner */}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-[11px] text-cyan-400">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span className="font-semibold">
                Demo mode — no real payment is charged. This is for
                testing.
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading || finalAmount <= 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {finalAmount > 0
                      ? `Add ${formatCurrency(finalAmount)}`
                      : "Add Money"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}