"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="grid h-24 w-24 place-items-center rounded-3xl bg-cyan-400/10 text-cyan-400"
      >
        <Gamepad2 size={48} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-7xl font-black tracking-tight md:text-9xl"
      >
        4<span className="text-cyan-400">0</span>4
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 max-w-md text-lg text-slate-400"
      >
        Looks like you wandered off the map. This page doesn&apos;t
        exist.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-wrap justify-center gap-3"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-black text-black transition hover:scale-[1.02]"
        >
          <Home size={17} />
          Back to Store
        </Link>

        <Link
          href="/search"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold transition hover:bg-white/10"
        >
          <Search size={17} />
          Search Products
        </Link>
      </motion.div>
    </main>
  );
}
