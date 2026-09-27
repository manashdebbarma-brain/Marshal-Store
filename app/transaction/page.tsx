"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import OrderCard from "@/components/OrderCard";
import OrderStats from "@/components/OrderStats";
import { getOrders, type StoredOrder } from "@/lib/storage";

type Filter = "all" | "placed" | "processing" | "completed";

export default function TransactionPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    function refresh() {
      setOrders(getOrders());
    }
    refresh();

    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const filtered = orders.filter((o) => {
    const matchesFilter =
      filter === "all" ||
      o.status === filter ||
      (filter === "processing" && o.status === "received");

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.orderId.toLowerCase().includes(q) ||
      o.playerId?.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All Orders", count: orders.length },
    {
      key: "placed",
      label: "Placed",
      count: orders.filter((o) => o.status === "placed").length,
    },
    {
      key: "processing",
      label: "Processing",
      count: orders.filter(
        (o) => o.status === "processing" || o.status === "received"
      ).length,
    },
    {
      key: "completed",
      label: "Completed",
      count: orders.filter((o) => o.status === "completed").length,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      {/* BACK */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Store
      </button>

      {/* HEADER */}
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-400">
          <ShoppingBag size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">My Orders</h1>
          <p className="text-sm text-slate-500">
            Track and manage your purchases
          </p>
        </div>
      </div>

      {/* STATS */}
      {orders.length > 0 && <OrderStats orders={orders} />}

      {/* SEARCH + FILTER */}
      {orders.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Player ID or product..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-cyan-400/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  filter === f.key
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span className="ml-1.5 opacity-60">({f.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="mt-6 space-y-3">
        {orders.length === 0 ? (
          // Empty state — no orders at all
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center"
          >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-cyan-400/10 text-cyan-400">
              <Package size={32} />
            </div>
            <h2 className="mt-4 text-xl font-black">No orders yet</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Start shopping and your purchases will appear here. Track
              delivery, view receipts, and reorder anytime.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
            >
              <ShoppingBag size={16} />
              Start Shopping
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          // Empty state — no results for filter/search
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="font-bold text-slate-400">No orders match</p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different filter or search term.
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((order, i) => (
            <OrderCard key={order.orderId} order={order} index={i} />
          ))
        )}
      </div>
    </main>
  );
}