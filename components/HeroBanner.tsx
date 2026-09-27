"use client";

import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroBanner() {
  return (
    <section className="mx-auto mt-4 max-w-7xl overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10">
      <div className="relative h-[300px] bg-gradient-to-r from-[#062a3a] via-[#0b4a5a] to-[#06b6d4] md:h-[380px]">
        {/* BG glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,242,254,.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(138,43,226,.35),transparent_45%)]" />

        {/* ✅ Character image — bigger, anchored bottom, doesn't crop head */}
        <img
          src="/hero-character.jpg"
          alt=""
          className="absolute bottom-0 left-0 z-0 hidden h-full w-[55%] object-contain object-left-bottom opacity-95 md:block"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Fade the character into the banner */}
        <div className="pointer-events-none absolute inset-y-0 left-[30%] z-[1] hidden w-[25%] bg-gradient-to-r from-transparent to-[#0b4a5a] md:block" />

        {/* Text block — always white because banner is dark */}
        <div className="relative z-10 flex h-full flex-col items-end justify-center px-6 text-right text-white md:px-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
            <Zap size={12} className="text-cyan-400" />
            Instant Delivery
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black italic tracking-tight drop-shadow-lg md:text-7xl"
          >
            TOPUP{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
              NOW
            </span>
          </motion.h1>

          <div className="mt-3 -skew-x-6 bg-white px-4 py-1">
            <p className="skew-x-6 text-[11px] font-black uppercase tracking-widest text-cyan-700 md:text-sm">
              Fastest Growing Gaming Store
            </p>
          </div>

          <div className="mt-4 hidden items-center gap-3 rounded-full border border-white/30 px-5 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur md:flex">
            MLBB <span className="opacity-50">•</span> BGMI{" "}
            <span className="opacity-50">•</span> WUTHERING WAVES
          </div>

          <Link
            href="/?parentId=84"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            Browse Top-Ups
            <ChevronRight size={16} />
          </Link>
        </div>

        <ChevronRight className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 text-white/40 md:block" />
      </div>
    </section>
  );
}