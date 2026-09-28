"use client";

import { Truck, ShieldCheck, Globe, MessageCircle } from "lucide-react";

const badges = [
  { icon: Truck, title: "24/7 INSTANT", subtitle: "DELIVERY" },
  { icon: ShieldCheck, title: "100% SAFE AND", subtitle: "LEGITIMATE" },
  { icon: Globe, title: "EASY AND SECURE", subtitle: "PAYMENT METHODS" },
  { icon: MessageCircle, title: "24/7 INSTANT", subtitle: "SUPPORT" },
];

export default function TrustBadges() {
  return (
    <section className="mx-auto w-full px-6 py-12">
      <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:grid-cols-2 md:grid-cols-4">
        {badges.map((b) => (
          <div key={b.title + b.subtitle} className="flex flex-col items-center text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-teal-400 text-black shadow-lg shadow-cyan/20">
              <b.icon size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-wider">
              {b.title}
            </p>
            <p className="text-xs font-black uppercase tracking-wider">
              {b.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}