"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setLocalTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocalTheme(getTheme());

    function refresh() {
      setLocalTheme(getTheme());
    }
    window.addEventListener("theme-updated", refresh);
    return () => {
      window.removeEventListener("theme-updated", refresh);
    };
  }, []);

  function handleToggle() {
    const next = toggleTheme();
    setLocalTheme(next);
  }

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 transition hover:bg-black/10 dark:hover:bg-white/10"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={18} className="text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={18} className="text-cyan-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}