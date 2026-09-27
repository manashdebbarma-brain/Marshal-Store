"use client";

import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";

export default function ExclusiveOffers() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <h2 className="mb-4 text-center text-xl font-black text-slate-900 dark:text-white">
        Exclusive Offers
      </h2>

      <Link
        href="/topup/mobile-legends"
        className="group mx-auto flex max-w-2xl items-center gap-4 overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-teal-500 p-4 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40"
      >
        {/* Icon — bigger, brighter */}
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-sm">
          <img
            src="/weekly-pass.jpg"
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Text — always black since the card is bright */}
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-base font-black text-black">
            <Zap size={15} className="fill-black" />
            Weekly Pass 147Rs
          </p>
          <p className="mt-1 text-sm font-bold text-black/80">
            Total of 220 diamonds, 210 Starlight pts, 70 COA over a 7-day
            period
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={20}
          className="shrink-0 text-black transition group-hover:translate-x-1"
        />
      </Link>
    </section>
  );
}