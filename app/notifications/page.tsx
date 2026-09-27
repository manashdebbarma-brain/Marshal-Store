"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trash2,
  Package,
  Sparkles,
  Info,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  timeAgo,
  type AppNotification,
  type NotificationType,
} from "@/lib/notifications";
import { toast } from "@/components/Toast";

type Filter = "all" | "unread" | "order" | "wallet" | "promo" | "system";

function iconFor(type: NotificationType) {
  if (type === "order") return <Package size={16} />;
  if (type === "wallet") return <Wallet size={16} />;
  if (type === "promo") return <Sparkles size={16} />;
  return <Info size={16} />;
}

function colorFor(type: NotificationType) {
  if (type === "order") return "bg-cyan-400/10 text-cyan-400";
  if (type === "wallet") return "bg-emerald-400/10 text-emerald-400";
  if (type === "promo") return "bg-purple-400/10 text-purple-400";
  return "bg-slate-400/10 text-slate-400";
}

function groupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  return "Older";
}

export default function NotificationsPage() {
  const router = useRouter();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setMounted(true);

    function refresh() {
      setItems(getNotifications());
    }
    refresh();

    window.addEventListener("notifications-updated", refresh);
    return () => {
      window.removeEventListener("notifications-updated", refresh);
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const grouped = useMemo(() => {
    const map: Record<string, AppNotification[]> = {};
    filtered.forEach((n) => {
      const key = groupLabel(n.timestamp);
      if (!map[key]) map[key] = [];
      map[key].push(n);
    });

    const order = ["Today", "Yesterday", "This Week", "Older"];
    return order
      .filter((k) => map[k] && map[k].length > 0)
      .map((k) => ({ label: k, items: map[k] }));
  }, [filtered]);

  const unread = items.filter((n) => !n.read).length;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: items.length },
    { key: "unread", label: "Unread", count: unread },
    {
      key: "order",
      label: "Orders",
      count: items.filter((n) => n.type === "order").length,
    },
    {
      key: "wallet",
      label: "Wallet",
      count: items.filter((n) => n.type === "wallet").length,
    },
    {
      key: "promo",
      label: "Promos",
      count: items.filter((n) => n.type === "promo").length,
    },
    {
      key: "system",
      label: "System",
      count: items.filter((n) => n.type === "system").length,
    },
  ];

  function handleItemClick(n: AppNotification) {
    markAsRead(n.id);
    if (n.actionHref) router.push(n.actionHref);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteNotification(id);
    toast("Notification removed", "info");
  }

  function handleMarkAll() {
    markAllAsRead();
    toast("All notifications marked as read", "success");
  }

  function handleClearAll() {
    if (!items.length) return;
    if (
      !confirm(
        "Clear all notifications? This cannot be undone."
      )
    )
      return;
    clearAll();
    toast("All notifications cleared", "info");
  }

  if (!mounted) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-slate-500">Loading notifications...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      {/* BACK */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Store
      </button>

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <Bell size={22} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black">Notifications</h1>
            <p className="text-sm text-slate-500">
              {items.length} total · {unread} unread
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/5 px-4 py-2 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/10"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/15"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* FILTERS */}
      {items.length > 0 && (
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
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
      )}

      {/* LIST */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center"
        >
          <div className="grid h-20 w-20 place-items-center rounded-full bg-cyan-400/10 text-cyan-400">
            <Bell size={32} />
          </div>
          <h2 className="mt-4 text-xl font-black">No notifications</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Order updates, promos, and system alerts will show up here.
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="font-bold text-slate-400">
            No notifications in this category
          </p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Show all
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
                {group.label}
              </h2>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {group.items.map((n, i) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group relative flex w-full items-start gap-3 rounded-2xl border border-white/10 p-4 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.04] ${
                        !n.read ? "bg-cyan-400/[0.04]" : "bg-white/[0.02]"
                      }`}
                    >
                      <button
                        onClick={() => handleItemClick(n)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        <div
                          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorFor(
                            n.type
                          )}`}
                        >
                          {iconFor(n.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm leading-tight ${
                                !n.read ? "font-black" : "font-semibold"
                              }`}
                            >
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {n.message}
                          </p>
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {timeAgo(n.timestamp)}
                          </p>
                        </div>
                      </button>

                      {/* ✅ Delete button on hover */}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg bg-red-500/10 text-red-400 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}