"use client";

import Link from "next/link";

const GAMES = [
  {
    slug: "mobile-legends",
    name: "Mobile Legends: Bang Bang",
    publisher: "Moonton",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
    badge: "Instant Delivery",
  },
  {
    slug: "free-fire",
    name: "Free Fire MAX",
    publisher: "Garena",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=60",
    badge: "Instant Delivery",
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile UC",
    publisher: "Krafton",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
    badge: "Instant Delivery",
  },
];

export default function GamesCatalog() {
  return (
    <div className="max-w-6xl mx-auto p-6 text-white mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Popular Games</h1>
        <p className="text-slate-400 text-sm mt-1">Select a game to instantly top up diamonds & UC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <Link
            key={game.slug}
            href={`/topup/${game.slug}`}
            className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl transition transform hover:-translate-y-1 block"
          >
            <div className="h-48 bg-slate-800 relative overflow-hidden">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
              />
              <span className="absolute top-3 right-3 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-full backdrop-blur-md">
                {game.badge}
              </span>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider">{game.publisher}</p>
              <h3 className="text-lg font-bold mt-1 text-white group-hover:text-cyan-400 transition">
                {game.name}
              </h3>
              <div className="mt-4 flex items-center justify-between text-sm font-medium text-cyan-400">
                <span>Top Up Now</span>
                <span className="transform group-hover:translate-x-1 transition">?</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
