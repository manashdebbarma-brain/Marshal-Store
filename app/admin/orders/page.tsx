"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
  Download,
  Copy,
  Check,
  TrendingUp,
  IndianRupee,
  Package,
} from "lucide-react";

import {
  isAdminLoggedIn,
  hasPermission,
} from "@/lib/admin";
import { getOrders, updateOrderStatus } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/Toast";

type OrderStatus = "placed" | "processing" | "completed" | "cancelled";

interface Order {
  orderId: string;
  productSlug?: string;
  productName: string;
  packageName: string;
  playerId?: string;
  serverId?: string;
  subtotal: number;
  processingFee: number;
  total: number;
  paymentMethod: string;
  status: string;
  timestamp: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  placed: {
    label: "Placed",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    icon: Clock3,
  },
  processing: {
    label: "Processing",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    icon: TrendingUp,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: XCircle,
  },
};

const FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "placed", label: "Placed" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (!isAdminLoggedIn()) {
      router.push("/admin/login?from=/admin/orders");
      return;
    }

    setCanManage(hasPermission("manage_orders"));

    const refresh = () => {
      setOrders(getOrders() as Order[]);
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("orders-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("orders-updated", refresh);
    };
  }, [router]);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (openDropdown) setOpenDropdown(null);
    }
    if (openDropdown) {
      document.addEventListener("click", handle);
      return () => document.removeEventListener("click", handle);
    }
  }, [openDropdown]);

  /* Filter + search */
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (filter !== "all") {
      list = list.filter((o) => o.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.packageName.toLowerCase().includes(q) ||
          (o.playerId && o.playerId.toLowerCase().includes(q)) ||
          (o.serverId && o.serverId.toLowerCase().includes(q))
      );
    }

    // Newest first
    return list.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [orders, filter, searchQuery]);

  /* Stats */
  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter(
      (o) => o.status === "placed" || o.status === "processing"
    ).length;
    const completed = orders.filter((o) => o.status === "completed").length;
    return { total, revenue, pending, completed };
  }, [orders]);

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    if (!canManage) {
      toast("You don't have permission to update orders", "error");
      return;
    }
    const ok = updateOrderStatus(orderId, newStatus);
    if (ok) {
      toast(`Order marked as ${STATUS_CONFIG[newStatus].label}`, "success");
    } else {
      toast("Failed to update order", "error");
    }
    setOpenDropdown(null);
  }

  function handleCopy(orderId: string) {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    toast("Order ID copied", "success");
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleExportCSV() {
    const headers = [
      "Order ID",
      "Product",
      "Package",
      "Player ID",
      "Server ID",
      "Payment",
      "Subtotal",
      "Fee",
      "Total",
      "Status",
      "Date",
    ];

    const rows = filteredOrders.map((o) => [
      o.orderId,
      o.productName,
      o.packageName,
      o.playerId || "",
      o.serverId || "",
      o.paymentMethod,
      o.subtotal.toString(),
      o.processingFee.toString(),
      o.total.toString(),
      o.status,
      new Date(o.timestamp).toLocaleString("en-IN"),
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
    a.download = `marshal-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Orders exported", "success");
  }

  if (!mounted) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">
              {canManage ? "Manage Orders" : "View Orders"}
            </h1>
            <p className="text-sm text-slate-500">
              {canManage
                ? "Track and update all customer orders"
                : "Browse all customer orders"}
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredOrders.length === 0}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatMini
          label="Total Orders"
          value={String(stats.total)}
          icon={ShoppingBag}
          gradient="from-cyan-500 to-teal-400"
        />
        <StatMini
          label="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={IndianRupee}
          gradient="from-purple-500 to-pink-500"
        />
        <StatMini
          label="Pending"
          value={String(stats.pending)}
          icon={Clock3}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatMini
          label="Completed"
          value={String(stats.completed)}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-green-500"
        />
      </div>

      {/* FILTERS + SEARCH */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Filter Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? orders.length
                : orders.filter((o) => o.status === f.key).length;

            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  filter === f.key
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                {f.label}
                <span
                  className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] ${
                    filter === f.key
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

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50"
          />
        </div>
      </div>

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-16 text-center">
          <Package size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500">
            {searchQuery.trim()
              ? `No orders matching "${searchQuery}"`
              : filter === "all"
              ? "No orders yet"
              : `No ${filter} orders`}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Order</th>
                  <th className="px-5 py-4 font-bold">Product</th>
                  <th className="px-5 py-4 font-bold">Payment</th>
                  <th className="px-5 py-4 font-bold">Total</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const statusKey = (
                    order.status in STATUS_CONFIG ? order.status : "placed"
                  ) as OrderStatus;
                  const cfg = STATUS_CONFIG[statusKey];
                  const StatusIcon = cfg.icon;

                  return (
                    <tr
                      key={order.orderId}
                      className="group transition hover:bg-white/[0.03]"
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(order.orderId)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-cyan-400"
                            title="Copy order ID"
                          >
                            {copiedId === order.orderId ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                          <div>
                            <p className="font-mono text-xs font-bold">
                              #{order.orderId.slice(-8)}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {new Date(order.timestamp).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" }
                              )}{" "}
                              ·{" "}
                              {new Date(order.timestamp).toLocaleTimeString(
                                "en-IN",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4">
                        <p className="font-bold">{order.productName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {order.packageName}
                        </p>
                        {order.playerId && (
                          <p className="mt-1 font-mono text-[10px] text-slate-600">
                            ID: {order.playerId}
                            {order.serverId && ` · S: ${order.serverId}`}
                          </p>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4 text-slate-400">
                        {order.paymentMethod}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-cyan-400">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-600">
                          Sub: {formatCurrency(order.subtotal)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${cfg.color} ${cfg.bg} ${cfg.border}`}
                        >
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          {canManage ? (
                            <div
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(
                                    openDropdown === order.orderId
                                      ? null
                                      : order.orderId
                                  );
                                }}
                                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10"
                              >
                                Update
                                <ChevronDown
                                  size={12}
                                  className={`transition ${
                                    openDropdown === order.orderId
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </button>

                              <AnimatePresence>
                                {openDropdown === order.orderId && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-10 z-10 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#111827] p-1 shadow-2xl"
                                  >
                                    {(
                                      Object.keys(
                                        STATUS_CONFIG
                                      ) as OrderStatus[]
                                    ).map((s) => {
                                      const sCfg = STATUS_CONFIG[s];
                                      const SIcon = sCfg.icon;
                                      const isCurrent = order.status === s;
                                      return (
                                        <button
                                          key={s}
                                          onClick={() =>
                                            handleStatusChange(
                                              order.orderId,
                                              s
                                            )
                                          }
                                          disabled={isCurrent}
                                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                            isCurrent
                                              ? "cursor-not-allowed opacity-50"
                                              : `${sCfg.color} hover:bg-white/5`
                                          }`}
                                        >
                                          <SIcon size={12} />
                                          {sCfg.label}
                                          {isCurrent && (
                                            <Check
                                              size={11}
                                              className="ml-auto"
                                            />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                              View only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* FOOTER INFO */}
      {filteredOrders.length > 0 && (
        <p className="mt-4 text-center text-xs text-slate-600">
          Showing {filteredOrders.length} of {orders.length} order
          {orders.length === 1 ? "" : "s"}
        </p>
      )}
    </main>
  );
}

/* =========================
   STAT MINI CARD
========================= */
function StatMini({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: any;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div
        className={`mb-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-black`}
      >
        <Icon size={16} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}