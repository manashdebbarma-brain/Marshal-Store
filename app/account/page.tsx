"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  Wallet,
  Bell,
  LogOut,
  Trash2,
  Save,
  X,
  Calendar,
  CheckCircle2,
  IndianRupee,
  Pencil,
  UserX,
  LogIn,
} from "lucide-react";

import {
  getUser,
  clearUser,
  updateUserName,
  type User,
} from "@/lib/auth";
import { getOrders, getWalletBalance, clearCart } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import LoginModal from "@/components/LoginModal";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState(0);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    function refresh() {
      const u = getUser();
      setUser(u);
      if (!u) return; // Don't redirect here — just show the "please login" view

      setDraftName(u.name);
      setOrders(getOrders());
      setWallet(getWalletBalance());
    }

    refresh();

    window.addEventListener("user-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("orders-updated", refresh);
    window.addEventListener("wallet-updated", refresh);

    return () => {
      window.removeEventListener("user-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("orders-updated", refresh);
      window.removeEventListener("wallet-updated", refresh);
    };
  }, []);

  /* ✅ After login modal closes, if user is now logged in, refresh the page */
  useEffect(() => {
    if (showLoginModal) return;
    const u = getUser();
    if (u) {
      setUser(u);
      setDraftName(u.name);
      setOrders(getOrders());
      setWallet(getWalletBalance());
    }
  }, [showLoginModal]);

  if (!mounted) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-slate-500">Loading account...</p>
      </main>
    );
  }

  /* ✅ Not logged in — show a friendly login prompt instead of redirecting */
  if (!user) {
    return (
      <>
        <main className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-cyan-400/10 text-cyan-400">
              <UserX size={34} />
            </div>
            <h1 className="text-2xl font-black">You're not logged in</h1>
            <p className="mt-3 text-sm text-slate-500">
              Login or create an account to view your profile, orders,
              wallet, and more.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
            >
              <LogIn size={16} />
              Login to Continue
            </button>
            <button
              onClick={() => router.push("/")}
              className="mt-3 block w-full text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-white"
            >
              Or continue browsing the store
            </button>
          </div>
        </main>

        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  /* ---------- Logged in view ---------- */
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const completed = orders.filter((o) => o.status === "completed").length;
  const memberSince = new Date(user.loggedInAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const initial = user.name.charAt(0).toUpperCase();

  function handleSaveName() {
    if (!draftName.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }
    const updated = updateUserName(draftName.trim());
    if (updated) {
      setUser(updated);
      toast("Name updated successfully", "success");
      setEditing(false);
    }
  }

  function handleLogout() {
    clearUser();
    toast("Logged out successfully", "info");
    router.push("/");
  }

  function handleDeleteAccount() {
    clearUser();
    clearCart();
    toast("Account deleted", "info");
    router.push("/");
  }

  const stats = [
    {
      label: "Total Orders",
      value: String(orders.length),
      icon: ShoppingBag,
      gradient: "from-cyan-500 to-teal-400",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: IndianRupee,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Wallet Balance",
      value: formatCurrency(wallet),
      icon: Wallet,
      gradient: "from-emerald-500 to-green-500",
    },
    {
      label: "Completed",
      value: String(completed),
      icon: CheckCircle2,
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

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

      {/* PROFILE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-400 text-3xl font-black text-black shadow-lg shadow-cyan-400/30">
            {initial}
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  autoFocus
                  className="rounded-xl border border-cyan-400/40 bg-white/5 px-4 py-2 text-2xl font-black text-white outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-black transition hover:scale-105"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraftName(user.name);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black md:text-3xl">
                  {user.name}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-cyan-400"
                  title="Edit name"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}

            <div className="mt-2 space-y-1 text-sm text-slate-400">
              {user.email && (
                <p className="flex items-center gap-2">
                  <Mail size={14} />
                  {user.email}
                </p>
              )}
              {user.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} />
                  +91 {user.phone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Calendar size={14} />
                Member since {memberSince}
              </p>
            </div>

            <span className="mt-3 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">
              {user.provider === "google" ? "Google Account" : "Phone Account"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div
              className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-black`}
            >
              <s.icon size={18} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-black">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/wallet"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <Wallet size={18} />
            </div>
            <div>
              <p className="font-bold group-hover:text-cyan-400">My Wallet</p>
              <p className="text-xs text-slate-500">
                {formatCurrency(wallet)} available
              </p>
            </div>
          </Link>

          <Link
            href="/transaction"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-purple-400/10 text-purple-400">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="font-bold group-hover:text-cyan-400">My Orders</p>
              <p className="text-xs text-slate-500">
                {orders.length} total purchase{orders.length === 1 ? "" : "s"}
              </p>
            </div>
          </Link>

          <Link
            href="/notifications"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Bell size={18} />
            </div>
            <div>
              <p className="font-bold group-hover:text-cyan-400">
                Notifications
              </p>
              <p className="text-xs text-slate-500">
                Check order updates
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-black text-red-400">Danger Zone</h2>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div>
              <p className="font-bold">Logout</p>
              <p className="text-xs text-slate-500">
                Sign out of your account on this device
              </p>
            </div>
            <button
              onClick={() => setLogoutOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.04] p-4">
            <div>
              <p className="font-bold text-red-400">Delete Account</p>
              <p className="text-xs text-slate-500">
                Permanently delete your account and data
              </p>
            </div>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <ConfirmModal
        open={logoutOpen}
        title="Log out?"
        message="You'll need to login again to access your account."
        confirmLabel="Logout"
        variant="primary"
        onConfirm={handleLogout}
        onClose={() => setLogoutOpen(false)}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete account?"
        message="This will permanently remove your account, orders, and wallet balance. This cannot be undone."
        confirmLabel="Delete forever"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteOpen(false)}
      />
    </main>
  );
}