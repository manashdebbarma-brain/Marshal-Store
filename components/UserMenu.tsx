"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Wallet,
  Package,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clearUser, getUser, type User as UserType } from "@/lib/auth";
import { toast } from "@/components/Toast";
import { Shield } from "lucide-react";

export default function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refresh() {
      setUser(getUser());
    }
    refresh();
    window.addEventListener("user-updated", refresh);
    return () => window.removeEventListener("user-updated", refresh);
  }, []);

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  function handleLogout() {
    clearUser();
    setOpen(false);
    toast("Logged out successfully", "info");
    router.push("/");
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/5 py-1.5 pl-1.5 pr-3 transition hover:bg-cyan-400/10"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 text-xs font-black text-black">
          {initial}
        </span>
        <span className="hidden text-sm font-bold text-cyan-400 md:inline">
          {user.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-cyan-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-white/5 p-4">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email || `+91 ${user.phone}`}
              </p>
            </div>

            {/* Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  router.push("/wallet");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-white/5"
              >
                <Wallet size={16} className="text-cyan-400" />
                My Wallet
              </button>

              <button
                onClick={() => {
                  router.push("/transaction");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-white/5"
              >
                <Package size={16} className="text-cyan-400" />
                My Orders
              </button>

              <button
                onClick={() => {
                  router.push("/account");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-white/5"
              >
                <User size={16} className="text-cyan-400" />
                Account
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-white/5 p-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}