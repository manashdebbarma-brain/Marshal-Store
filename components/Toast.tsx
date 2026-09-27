"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

let pushToastExternal: ((msg: string, type?: ToastType) => void) | null =
  null;

export function toast(message: string, type: ToastType = "success") {
  if (pushToastExternal) {
    pushToastExternal(message, type);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToastExternal = (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    };
    return () => {
      pushToastExternal = null;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur ${
              t.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : t.type === "error"
                ? "border-red-400/30 bg-red-500/10 text-red-300"
                : "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
            }`}
          >
            {t.type === "success" && (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            {t.type === "error" && (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            )}
            {t.type === "info" && (
              <Info size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="text-sm font-semibold leading-tight">
              {t.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}