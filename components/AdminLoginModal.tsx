"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, X, ArrowRight, User, Lock } from "lucide-react";

import { adminLogin } from "@/lib/admin";
import { toast } from "@/components/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdminId("");
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = adminLogin(adminId, password);
      if (success) {
        toast("Welcome back!", "success");
        onClose();
        router.push("/admin");
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>

            <motion.form
              onSubmit={handleSubmit}
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40"
                >
                  <ShieldCheck size={30} className="text-black" />
                </motion.div>
                <h2 className="text-2xl font-black text-white">Admin Access</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Secure Login
                </p>
              </div>

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
              <div className="mb-6">
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

              {/* Submit */}
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

              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                🔒 Protected by Marshal Security
              </p>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}