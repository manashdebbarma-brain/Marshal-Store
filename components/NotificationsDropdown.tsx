"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Package,
  Sparkles,
  Info,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

function iconFor(type: NotificationType) {
  if (type === "order") return <Package size={15} />;
  if (type === "wallet") return <Wallet size={15} />;
  if (type === "promo") return <Sparkles size={15} />;
  return <Info size={15} />;
}

function colorFor(type: NotificationType) {
  if (type === "order") return "bg-cyan-400/10 text-cyan-400";
  if (type === "wallet") return "bg-emerald-400/10 text-emerald-400";
  if (type === "promo") return "bg-purple-400/10 text-purple-400";
  return "bg-slate-400/10 text-slate-400";
}

export default function NotificationsDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refresh() {
      setItems(getNotifications());
    }
    refresh();
    window.addEventListener("notifications-updated", refresh);
    return () => {
      window.removeEventListener("notifications-updated", refresh);
    };
  }, []);

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function handleItemClick(n: AppNotification) {
    markAsRead(n.id);
    if (n.actionHref) {
      router.push(n.actionHref);
      setOpen(false);
    }
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteNotification(id);
    toast("Notification removed", "info");
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm("Clear all notifications? This cannot be undone.")
    )
      return;
    clearAll();
    toast("All notifications cleared", "info");
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell size={18} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-14 z-50 w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div>
                <h3 className="text-sm font-black">Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unread > 0 ? `${unread} unread` : "All caught up"}
                </p>
              </div>

              {items.length > 0 && (
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-cyan-400"
                    >
                      <CheckCheck size={15} />
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    title="Clear all"
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-white/5 text-slate-500">
                    <Bell size={22} />
                  </div>
                  <p className="mt-3 text-sm font-bold">No notifications</p>
                  <p className="mt-1 text-xs text-slate-500">
                    We&apos;ll notify you about orders and offers here.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.slice(0, 12).map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group relative flex items-start gap-3 border-b border-white/5 p-4 text-left transition last:border-0 hover:bg-white/[0.03] ${
                        !n.read ? "bg-cyan-400/[0.03]" : ""
                      }`}
                    >
                      <button
                        onClick={() => handleItemClick(n)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        <div
                          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${colorFor(
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
                          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {timeAgo(n.timestamp)}
                          </p>
                        </div>
                      </button>

                      {/* ✅ Delete button */}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-red-500/10 text-red-400 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X size={11} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — View all */}
            {items.length > 0 && (
              <div className="border-t border-white/5 p-3 text-center">
                <button
                  onClick={() => {
                    router.push("/notifications");
                    setOpen(false);
                  }}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  View all notifications →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}