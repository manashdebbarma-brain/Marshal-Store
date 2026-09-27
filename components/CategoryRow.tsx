"use client";

import Link from "next/link";

const items = [
  {
    name: "Discord Server Boost",
    slug: "discord",
    image: "/cat/discord.png",
    emoji: "🎮",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "Game Accounts",
    slug: "accounts",
    image: "/cat/accounts.png",
    emoji: "🕹️",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Game Topup",
    slug: "topup",
    image: "/cat/topup.png",
    emoji: "💎",
    gradient: "from-cyan-500 to-teal-400",
  },
  {
    name: "OTT / Premium",
    slug: "ott",
    image: "/cat/ott.png",
    emoji: "📺",
    gradient: "from-red-500 to-pink-500",
  },
  {
    name: "Windows Products",
    slug: "windows",
    image: "/cat/windows.png",
    emoji: "🪟",
    gradient: "from-sky-500 to-blue-600",
  },
];

export default function CategoryRow() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <h2 className="mb-8 text-center text-2xl font-black">
        All Categories
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {items.map((cat) => (
          <Link
            key={cat.slug}
            href={`/?parentId=${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center transition hover:-translate-y-1 hover:border-cyan/40"
          >
            <div
              className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-4xl shadow-lg`}
            >
              <span>{cat.emoji}</span>
            </div>
            <p className="text-sm font-bold leading-tight group-hover:text-cyan">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}