"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, ArrowRight, User, Lock } from "lucide-react";

import { adminLogin, isAdminLoggedIn } from "@/lib/admin";
import { toast } from "@/components/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      // ✅ If already logged in, redirect to "from" target or /admin
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from") || "/admin";
      router.push(from);
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = adminLogin(adminId, password);
      if (success) {
        toast("Welcome back!", "success");

        // ✅ Redirect to where they were trying to go, or /admin by default
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from") || "/admin";
        router.push(from);
      } else {
        toast("Invalid Admin ID or password", "error");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setLoading(false);
      setPassword("");
    }, 400);
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"
          >
            <ShieldCheck size={36} className="text-black" />
          </motion.div>
          <h1 className="text-3xl font-black">Admin Access</h1>
          <p className="mt-2 text-sm text-slate-500">
            Secure area — authorized personnel only
          </p>
        </div>

        <motion.form
          onSubmit={handleLogin}
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          {/* Admin ID */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Admin ID
            </label>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="e.g. manash"
                autoFocus
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !adminId || !password}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                Unlock Dashboard
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-slate-600">
            Protected by Marshal Store Security
          </p>
        </motion.form>
      </motion.div>
    </main>
  );
}