"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/storage";

interface Props {
  item: CartItemType;
  index: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  index,
  onQuantityChange,
  onRemove,
}: Props) {
  const subtotal = item.amount * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:border-cyan-400/40 dark:border-white/10 dark:bg-white/[0.03]"
    >
      <div className="flex items-start gap-4">
        {/* PRODUCT IMAGE / ICON */}
        <Link
          href={`/topup/${item.productSlug}`}
          className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900"
        >
          {/* Fallback initials behind image */}
          <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white/20">
            {item.productName.substring(0, 2)}
          </span>

          <img
            src={`/games/${item.productSlug}.jpg`}
            alt={item.productName}
            className="relative h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </Link>

        {/* DETAILS */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/topup/${item.productSlug}`}
            className="block text-sm font-black text-slate-900 transition hover:text-cyan-500 dark:text-white dark:hover:text-cyan-400"
          >
            {item.productName}
          </Link>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {item.packageName}
          </p>

          <p className="mt-2 text-sm font-bold text-cyan-500 dark:text-cyan-400">
            {formatCurrency(item.amount)} each
          </p>

          {/* QUANTITY + REMOVE */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {/* Quantity control */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
              <button
                onClick={() =>
                  onQuantityChange(item.id, Math.max(1, item.quantity - 1))
                }
                disabled={item.quantity <= 1}
                className="grid h-9 w-9 place-items-center text-slate-600 transition hover:text-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:text-cyan-400"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span className="min-w-[2rem] text-center text-sm font-black text-slate-900 dark:text-white">
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  onQuantityChange(
                    item.id,
                    Math.min(99, item.quantity + 1)
                  )
                }
                disabled={item.quantity >= 99}
                className="grid h-9 w-9 place-items-center text-slate-600 transition hover:text-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:text-cyan-400"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Remove button */}
            <button
              onClick={() => onRemove(item.id)}
              className="flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500/15 dark:text-red-400"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>

        {/* SUBTOTAL */}
        <div className="shrink-0 text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Subtotal
          </p>
          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(subtotal)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}