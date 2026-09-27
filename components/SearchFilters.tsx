"use client";

import { motion } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";

export type Filters = {
  category: string | null;
  publisher: string | null;
  maxPrice: number;
};

export default function SearchFilters({
  categories,
  publishers,
  filters,
  onChange,
  onReset,
  mobileOpen,
  onMobileClose,
}: {
  categories: string[];
  publishers: string[];
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs font-bold text-cyan-400 hover:underline"
        >
          Reset all
        </button>
      </div>

      {/* Category */}
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
          Category
        </p>
        <div className="space-y-1.5">
          <button
            onClick={() => update("category", null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              filters.category === null
                ? "bg-cyan-400/10 text-cyan-400"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => update("category", c)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                filters.category === c
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "text-slate-400 hover:bg-white/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Publisher */}
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
          Publisher
        </p>
        <div className="space-y-1.5">
          <button
            onClick={() => update("publisher", null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              filters.publisher === null
                ? "bg-cyan-400/10 text-cyan-400"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            All Publishers
          </button>
          {publishers.map((p) => (
            <button
              key={p}
              onClick={() => update("publisher", p)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                filters.publisher === p
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "text-slate-400 hover:bg-white/5"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
          Max Price
        </p>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>₹0</span>
          <span className="font-black text-cyan-400">
            ₹{filters.maxPrice}
          </span>
          <span>₹5000</span>
        </div>
      </div>
    </div>
  );

  /* Desktop — always visible sidebar */
  return (
    <>
      <aside className="hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:block">
        {content}
      </aside>

      {/* Mobile — slide-in drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-[#0f172a] p-5"
          >
            <button
              onClick={onMobileClose}
              className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
            >
              <X size={16} /> Close
            </button>
            {content}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* Mobile trigger button — export separately */
export function MobileFilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 lg:hidden"
    >
      <SlidersHorizontal size={15} />
      Filters
    </button>
  );
}