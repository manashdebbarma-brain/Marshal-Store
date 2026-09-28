"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  TrendingUp,
  Users,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  Eye,
  Clock,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  isAdminLoggedIn,
  adminLogout,
  getAdminSession,
  hasPermission,
} from "@/lib/admin";
import { getOrders } from "@/lib/storage";
import { getAllProducts } from "@/lib/productStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/Toast";

import AnimatedCounter from "@/components/AnimatedCounter";
import SalesChart from "@/components/SalesChart";
import ActivityFeed from "@/components/ActivityFeed";

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    if (!isAdminLoggedIn()) {
      router.push("/admin/login?from=/admin");
      return;
    }

    const refresh = () => {
      setOrders(getOrders());
      setProducts(getAllProducts());
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("products-updated", refresh);
    window.addEventListener("orders-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("products-updated", refresh);
      window.removeEventListener("orders-updated", refresh);
    };
  }, [router]);

  /* ---- Derived data ---- */
  const session = getAdminSession();
  const canViewStats = hasPermission("view_stats");
  const canManageProducts = hasPermission("manage_products");
  const canManageOrders = hasPermission("manage_orders");
  const canManageAdmins = hasPermission("manage_admins");

  const revenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const today = new Date().toDateString();
  const todayOrders = useMemo(
    () =>
      orders.filter(
        (o) => new Date(o.timestamp).toDateString() === today
      ).length,
    [orders, today]
  );

  const todayRevenue = useMemo(
    () =>
      orders
        .filter(
          (o) => new Date(o.timestamp).toDateString() === today
        )
        .reduce((sum, o) => sum + o.total, 0),
    [orders, today]
  );

  /* Weekly sales — last 7 days including today */
  const weeklyData = useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days: { label: string; amount: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();

      const amount = orders
        .filter(
          (o) => new Date(o.timestamp).toDateString() === dateStr
        )
        .reduce((sum, o) => sum + o.total, 0);

      days.push({
        label: labels[d.getDay()],
        amount,
      });
    }

    return days;
  }, [orders]);

  /* Top products by number of orders */
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};

    orders.forEach((o) => {
      const key = o.productSlug || o.productName;
      if (!counts[key]) {
        counts[key] = {
          name: o.productName,
          count: 0,
          revenue: 0,
        };
      }
      counts[key].count += 1;
      counts[key].revenue += o.total;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const maxCount = topProducts[0]?.count || 1;

  /* Greeting based on time of day */
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  function handleLogout() {
    adminLogout();
    toast("Logged out of admin", "info");
    router.push("/admin/login");
  }

  if (!mounted) {
    return (
      <main className="mx-auto w-full px-4 py-20 text-center">
        <p className="text-slate-500">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full px-4 py-8 md:px-6">
      {/* =========================
          HERO HEADER
      ========================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 text-2xl font-black text-black shadow-lg shadow-cyan-400/30">
              {session?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                {greeting}
              </p>
              <h1 className="mt-1 text-3xl font-black md:text-4xl">
                {session?.name || "Admin"}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {session?.role === "AUTHOR" &&
                  "👑 Boss — Full access to everything"}
                {session?.role === "PETITION" &&
                  "Co-Admin — Manage products & orders"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-widest ${
                session?.role === "AUTHOR"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-400"
                  : "border-purple-400/30 bg-purple-500/10 text-purple-400"
              }`}
            >
              {session?.role === "AUTHOR" ? (
                <ShieldCheck size={14} />
              ) : (
                <Eye size={14} />
              )}
              {session?.role || "GUEST"}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/15"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* =========================
          STATS GRID
      ========================= */}
      {canViewStats && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={revenue}
            icon={IndianRupee}
            gradient="from-cyan-500 to-teal-400"
            prefix="₹"
            delay={0}
          />
          <StatCard
            label="Total Orders"
            value={orders.length}
            icon={ShoppingBag}
            gradient="from-purple-500 to-pink-500"
            delay={0.05}
          />
          <StatCard
            label="Today's Revenue"
            value={todayRevenue}
            icon={TrendingUp}
            gradient="from-yellow-500 to-orange-500"
            prefix="₹"
            delay={0.1}
          />
          <StatCard
            label="Products"
            value={products.length}
            icon={Package}
            gradient="from-emerald-500 to-green-500"
            delay={0.15}
          />
        </div>
      )}

      {/* =========================
          QUICK ACTIONS
      ========================= */}
      <div
        className={`mt-6 grid gap-4 ${
          canManageAdmins ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <QuickAction
          href="/admin/products"
          title={canManageProducts ? "Manage Products" : "View Products"}
          description={
            canManageProducts
              ? "Add, edit or delete products and packages"
              : "Browse the product catalog"
          }
          icon={Package}
          iconBg="bg-purple-400/10"
          iconColor="text-purple-400"
        />
        <QuickAction
          href="/admin/orders"
          title={canManageOrders ? "Manage Orders" : "View Orders"}
          description={
            canManageOrders
              ? "See all customer orders and update status"
              : "Browse customer orders"
          }
          icon={ShoppingBag}
          iconBg="bg-cyan-400/10"
          iconColor="text-cyan-400"
        />
        {canManageAdmins && (
          <QuickAction
            href="/admin/admins"
            title="Manage Admins"
            description="Add or remove team members"
            icon={Users}
            iconBg="bg-yellow-400/10"
            iconColor="text-yellow-400"
          />
        )}
      </div>

      {/* =========================
          CHART + ACTIVITY
      ========================= */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <SalesChart data={weeklyData} />
        <ActivityFeed
          orders={orders.map((o) => ({
            id: o.orderId,
            productName: o.productName,
            packageName: o.packageName,
            total: o.total,
            timestamp: o.timestamp,
            status: o.status,
          }))}
        />
      </div>

      {/* =========================
          TOP PRODUCTS
      ========================= */}
      {topProducts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Trophy size={16} />
            </div>
            <div>
              <h3 className="text-lg font-black">Top Selling Products</h3>
              <p className="text-xs text-slate-500">
                Ranked by number of orders
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const pct = (p.count / maxCount) * 100;
              return (
                <div key={p.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-lg text-[10px] font-black ${
                          i === 0
                            ? "bg-yellow-400 text-black"
                            : i === 1
                            ? "bg-slate-400 text-black"
                            : i === 2
                            ? "bg-amber-600 text-white"
                            : "bg-white/10 text-slate-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-bold">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        {p.count} order{p.count === 1 ? "" : "s"}
                      </span>
                      <span className="font-bold text-cyan-400">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${
                        i === 0
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-300"
                          : "bg-gradient-to-r from-cyan-500/60 to-cyan-400/40"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================
          RECENT ORDERS
      ========================= */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Recent Orders</h2>
          {canManageOrders && (
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-cyan-400 transition hover:gap-2"
            >
              View all
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <Sparkles size={28} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500">No orders yet</p>
            <p className="mt-1 text-xs text-slate-600">
              Your first order will show up here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20"
              >
                <div>
                  <p className="font-bold">
                    {order.productName} — {order.packageName}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={11} />
                    #{order.orderId} ·{" "}
                    {new Date(order.timestamp).toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="font-black text-cyan-400">
                  {formatCurrency(order.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  prefix = "",
  delay = 0,
}: {
  label: string;
  value: number;
  icon: any;
  gradient: string;
  prefix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-cyan-400/30"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-500/5 opacity-0 blur-2xl transition group-hover:opacity-100" />

      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-black`}
      >
        <Icon size={18} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">
        <AnimatedCounter value={value} prefix={prefix} />
      </p>
    </motion.div>
  );
}

/* =========================
   QUICK ACTION
========================= */
function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  href: string;
  title: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/40"
    >
      <div className="flex items-center gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl ${iconBg} ${iconColor}`}
        >
          <Icon size={24} />
        </div>
        <div>
          <p className="text-lg font-black group-hover:text-cyan-400">
            {title}
          </p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ArrowRight
        size={20}
        className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-400"
      />
    </Link>
  );
}