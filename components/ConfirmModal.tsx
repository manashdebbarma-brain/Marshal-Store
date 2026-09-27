"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
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
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-500 transition hover:text-white"
            >
              <X size={18} />
            </button>

            <div
              className={`grid h-12 w-12 place-items-center rounded-2xl ${
                variant === "danger"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-cyan-400/10 text-cyan-400"
              }`}
            >
              <AlertTriangle size={22} />
            </div>

            <h2 className="mt-4 text-xl font-black">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{message}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 rounded-xl py-3 font-black transition hover:scale-[1.02] ${
                  variant === "danger"
                    ? "bg-red-500 text-white"
                    : "bg-cyan-400 text-black"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}