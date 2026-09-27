"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Clock } from "lucide-react";

import { categories } from "@/lib/mockData";
import { getAllProducts, AdminProduct } from "@/lib/productStore";

import HeroBanner from "@/components/HeroBanner";
import ExclusiveOffers from "@/components/ExclusiveOffers";
import CategoryRow from "@/components/CategoryRow";
import TrustBadges from "@/components/TrustBadges";

function HomeContent() {
  const searchParams = useSearchParams();
  const parentId = Number(searchParams.get("parentId") || 84);

  // ✅ Live products from localStorage (synced with admin)
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProducts(getAllProducts());

    const refresh = () => setProducts(getAllProducts());
    window.addEventListener("products-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("products-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const activeCategory =
    categories.find((category) => category.id === parentId) ||
    categories[0];

  const filteredProducts = products.filter(
    (product) => product.parentId === parentId
  );

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-slate-500">Loading store...</p>
      </div>
    );
  }

  return (
    <div>
      <HeroBanner />
      <ExclusiveOffers />
      <CategoryRow />

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Instant Delivery",
              text: "Digital products delivered in seconds.",
            },
            {
              icon: ShieldCheck,
              title: "Secure Checkout",
              text: "UPI, cards, netbanking, wallet.",
            },
            {
              icon: Clock,
              title: "24/7 Ordering",
              text: "Purchase whenever you want.",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-5">
              <item.icon className="mb-3 text-cyan-400" size={22} />
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Marketplace
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {activeCategory?.name}
          </h2>
          <p className="mt-2 text-slate-500">
            {activeCategory?.description}
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/?parentId=${category.id}`}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                category.id === parentId
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* GAME GRID */}
        {filteredProducts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-slate-500">
              No products available in this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/topup/${product.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                    {/* Fallback initials — always behind the image */}
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/10">
                      {product.name.substring(0, 2)}
                    </div>

                    {/* Game logo — tries multiple extensions */}
                    <img
                      src={`/games/${product.slug}.jpg`}
                      alt={product.name}
                      className="relative h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        const cleanSrc = img.src.split("?")[0];

                        if (cleanSrc.endsWith(".jpg")) {
                          img.src = `/games/${product.slug}.jpeg`;
                        } else if (cleanSrc.endsWith(".jpeg")) {
                          img.src = `/games/${product.slug}.png`;
                        } else if (cleanSrc.endsWith(".png")) {
                          img.src = `/games/${product.slug}.webp`;
                        } else {
                          img.style.display = "none";
                        }
                      }}
                    />

                    {/* Discount badge */}
                    {product.discount ? (
                      <div className="absolute left-3 top-3 rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-black text-black shadow-lg">
                        -{product.discount}%
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-slate-500">
                      {product.publisher}
                    </p>
                    <h3 className="mt-1 font-bold transition group-hover:text-cyan-400">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        From ₹
                        {Math.min(
                          ...product.packages.map((item) => item.amount)
                        )}
                      </span>
                      <ArrowRight
                        size={17}
                        className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-400"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <TrustBadges />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-slate-500">Loading store...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}