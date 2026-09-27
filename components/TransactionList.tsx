"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  Search,
  Download,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { WalletTransaction } from "@/lib/storage";

interface Props {
  transactions: WalletTransaction[];
}

type Filter = "all" | "credit" | "debit";

export default function TransactionList({ transactions }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  /* Filter + search */
  const filtered = useMemo(() => {
    let list = [...transactions];

    if (filter !== "all") {
      list = list.filter((t) => t.type === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, filter, search]);

  /* Group by date */
  const grouped = useMemo(() => {
    const groups: Record<string, WalletTransaction[]> = {};

    filtered.forEach((t) => {
      const date = new Date(t.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year:
            date.getFullYear() !== today.getFullYear()
              ? "numeric"
              : undefined,
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    return groups;
  }, [filtered]);

  /* Stats */
  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  /* CSV Export */
  function handleExportCSV() {
    if (filtered.length === 0) return;

    const headers = ["ID", "Type", "Amount", "Description", "Balance After", "Date"];
    const rows = filtered.map((t) => [
      t.id,
      t.type,
      t.amount.toString(),
      t.description,
      t.balanceAfter.toString(),
      new Date(t.timestamp).toLocaleString("en-IN"),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* STATS */}
      {transactions.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <ArrowUpRight size={16} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Total Added
            </p>
            <p className="mt-1 text-lg font-black text-emerald-400">
              {formatCurrency(totalCredit)}
            </p>
          </div>
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
            <div className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-red-400/10 text-red-400">
              <ArrowDownLeft size={16} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Total Spent
            </p>
            <p className="mt-1 text-lg font-black text-red-400">
              {formatCurrency(totalDebit)}
            </p>
          </div>
        </div>
      )}

      {/* FILTERS + SEARCH */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {(["all", "credit", "debit"] as Filter[]).map((f) => {
            const count =
              f === "all"
                ? transactions.length
                : transactions.filter((t) => t.type === f).length;

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold capitalize transition ${
                  filter === f
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                {f === "credit" && <Plus size={11} />}
                {f === "debit" && <Minus size={11} />}
                {f === "all" ? "All" : f}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    filter === f
                      ? "bg-cyan-400/20 text-cyan-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={13} />
            CSV
          </button>
        </div>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-cyan-400/10 text-cyan-400">
            <Receipt size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-400">
            {transactions.length === 0
              ? "No transactions yet"
              : "No transactions match your filters"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {transactions.length === 0
              ? "Add money to your wallet to get started"
              : "Try clearing your search or filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {dateLabel}
              </p>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {items.map((t, i) => {
                  const isCredit = t.type === "credit";
                  const time = new Date(t.timestamp).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className={`flex items-center gap-4 p-4 transition hover:bg-white/[0.03] ${
                        i !== items.length - 1
                          ? "border-b border-white/5"
                          : ""
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          isCredit
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-red-400/10 text-red-400"
                        }`}
                      >
                        {isCredit ? (
                          <Plus size={16} strokeWidth={3} />
                        ) : (
                          <Minus size={16} strokeWidth={3} />
                        )}
                      </div>

                      {/* Description */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                          {t.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {time} · Balance{" "}
                          {formatCurrency(t.balanceAfter)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p
                          className={`text-sm font-black ${
                            isCredit
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}