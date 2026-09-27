"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  KeyRound,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";

import {
  loginWithGoogle,
  loginWithPhone,
  sendOtp,
  verifyOtp,
} from "@/lib/auth";
import { adminLogin } from "@/lib/admin";
import { toast } from "@/components/Toast";

type View = "options" | "otp" | "password";
type Tab = "customer" | "admin";

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("customer");

  // Customer state
  const [view, setView] = useState<View>("options");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);

  // Admin state
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminShake, setAdminShake] = useState(false);

  /* Resend countdown */
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  /* Reset everything when closed */
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTab("customer");
        setView("options");
        setPhone("");
        setOtp("");
        setExpectedOtp("");
        setResendIn(0);
        setAdminId("");
        setAdminPassword("");
        setShowAdminPassword(false);
      }, 200);
    }
  }, [open]);

  /* Customer: Google login */
  function handleGoogleLogin() {
    setLoading(true);
    setTimeout(() => {
      const user = loginWithGoogle("Acer");
      toast(`Welcome, ${user.name}!`, "success");
      setLoading(false);
      onClose();
    }, 700);
  }

  /* Customer: Send OTP */
  function handleSendOtp() {
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) {
      toast("Enter a valid 10-digit mobile number", "error");
      return;
    }
    const code = sendOtp(clean);
    setExpectedOtp(code);
    setResendIn(30);
    setView("otp");
    toast("OTP generated (demo mode)", "success");
  }

  /* Customer: Verify OTP */
  function handleVerifyOtp() {
    if (otp.trim().length !== 6) {
      toast("Enter the 6-digit OTP", "error");
      return;
    }
    if (!verifyOtp(otp, expectedOtp)) {
      toast("Incorrect OTP. Try again.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = loginWithPhone(phone, "Acer");
      toast(`Welcome, ${user.name}!`, "success");
      setLoading(false);
      onClose();
    }, 600);
  }

  /* Customer: Resend OTP */
  function handleResend() {
    const code = sendOtp(phone);
    setExpectedOtp(code);
    setResendIn(30);
    setOtp("");
    toast("OTP regenerated", "success");
  }

  /* Admin: Login — with ?from= handling */
  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminLoading(true);

    setTimeout(() => {
      const success = adminLogin(adminId, adminPassword);
      if (success) {
        toast("Welcome, Admin!", "success");
        onClose();

        // ✅ Redirect to ?from= target or /admin
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from") || "/admin";
        router.push(from);
      } else {
        toast("Invalid Admin ID or password", "error");
        setAdminShake(true);
        setTimeout(() => setAdminShake(false), 500);
      }
      setAdminLoading(false);
      setAdminPassword("");
    }, 400);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl md:p-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 text-slate-500 transition hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Back button (only in OTP / Password views) */}
            {tab === "customer" && view !== "options" && (
              <button
                onClick={() => setView("options")}
                className="absolute left-4 top-4 flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-white"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {/* =========================
                TAB SWITCHER
            ========================= */}
            <div className="mb-6 flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setTab("customer")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition ${
                  tab === "customer"
                    ? "bg-cyan-400 text-black"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Users size={13} />
                Customer
              </button>
              <button
                onClick={() => setTab("admin")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition ${
                  tab === "admin"
                    ? "bg-cyan-400 text-black"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <ShieldCheck size={13} />
                Admin
              </button>
            </div>

            {/* =========================
                CUSTOMER TAB
            ========================= */}
            {tab === "customer" && (
              <>
                {/* VIEW: OPTIONS */}
                {view === "options" && (
                  <div>
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-400">
                      <ShieldCheck size={26} />
                    </div>

                    <h2 className="text-center text-2xl font-black">
                      Welcome Back
                    </h2>
                    <p className="mt-1 text-center text-sm text-slate-500">
                      Login to continue shopping
                    </p>

                    {/* Google */}
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-bold text-slate-900 transition hover:scale-[1.01] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      {loading ? "Signing in..." : "Sign in with Google"}
                    </button>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-500">
                      <div className="h-px flex-1 bg-white/10" />
                      OR
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Login with OTP
                    </p>

                    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 focus-within:border-cyan-400/50">
                      <span className="border-r border-white/10 px-3 py-3 text-sm font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                        placeholder="Enter mobile number"
                        inputMode="numeric"
                        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={phone.length !== 10}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Phone size={17} />
                      Send OTP
                    </button>

                    <button
                      onClick={() => setView("password")}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-5 py-3 font-bold text-cyan-400 transition hover:bg-cyan-400/10"
                    >
                      <KeyRound size={16} />
                      Login with Password
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-500">
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => toast("Signup coming soon", "info")}
                        className="font-bold text-cyan-400 hover:underline"
                      >
                        Create New Account
                      </button>
                    </p>
                  </div>
                )}

                {/* VIEW: OTP */}
                {view === "otp" && (
                  <div className="pt-8">
                    <h2 className="text-center text-2xl font-black">
                      Verify OTP
                    </h2>
                    <p className="mt-1 text-center text-sm text-slate-500">
                      Sent to{" "}
                      <span className="font-bold text-cyan-400">
                        +91 {phone}
                      </span>
                    </p>

                    {/* ✅ DEMO OTP DISPLAY */}
                    <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                        🧪 Demo Mode — Your OTP
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-[0.5em] text-cyan-400">
                        {expectedOtp}
                      </p>
                      <p className="mt-2 text-[10px] text-slate-500">
                        (In production, this is sent to your phone via SMS)
                      </p>
                    </div>

                    <div className="mt-6">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Enter 6-digit OTP
                      </label>
                      <input
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        placeholder="••••••"
                        inputMode="numeric"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-white outline-none transition focus:border-cyan-400/50"
                      />
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-500">
                      {resendIn > 0 ? (
                        <>Resend OTP in {resendIn}s</>
                      ) : (
                        <button
                          onClick={handleResend}
                          className="font-bold text-cyan-400 hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </p>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6 || loading}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP & Login"
                      )}
                    </button>
                  </div>
                )}

                {/* VIEW: PASSWORD */}
                {view === "password" && (
                  <div className="pt-8">
                    <h2 className="text-center text-2xl font-black">
                      Login with Password
                    </h2>
                    <p className="mt-1 text-center text-sm text-slate-500">
                      Password login coming soon
                    </p>

                    <button
                      onClick={() =>
                        toast("Password login is coming soon", "info")
                      }
                      className="mt-6 w-full rounded-xl bg-cyan-400 py-3.5 font-black text-black"
                    >
                      Coming Soon
                    </button>
                  </div>
                )}
              </>
            )}

            {/* =========================
                ADMIN TAB
            ========================= */}
            {tab === "admin" && (
              <motion.form
                onSubmit={handleAdminLogin}
                animate={adminShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40"
                  >
                    <ShieldCheck size={30} className="text-black" />
                  </motion.div>
                  <h2 className="text-2xl font-black">Admin Access</h2>
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
                    <UserIcon
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. manash"
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
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowAdminPassword(!showAdminPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    >
                      {showAdminPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    adminLoading || !adminId || !adminPassword
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adminLoading ? (
                    "Verifying..."
                  ) : (
                    <>
                      Unlock Dashboard
                      <ArrowLeft
                        size={16}
                        className="rotate-180 transition group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  🔒 Protected by Marshal Security
                </p>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}