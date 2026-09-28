"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search as SearchIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { getAllProducts, AdminProduct } from "@/lib/productStore";
import { formatCurrency } from "@/lib/utils";
import SearchFilters, {
  MobileFilterButton,
  type Filters,
} from "@/components/SearchFilters";

const SORTS = [
  { key: "popular", label: "Popular" },
  { key: "price-asc", label: "Price: Low → High" },
  { key: "price-desc", label: "Price: High → Low" },
  { key: "name", label: "Name A → Z" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

function minPrice(p: AdminProduct) {
  if (!p.packages || p.packages.length === 0) return 0;
  return Math.min(...p.packages.map((i) => i.amount));
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: null,
    publisher: null,
    maxPrice: 5000,
  });
  const [sort, setSort] = useState<SortKey>("popular");
  const [mobileFilters, setMobileFilters] = useState(false);

  /* Re-search when query in URL changes */
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  /* ✅ Load products from LIVE store (syncs with admin) */
  useEffect(() => {
    setMounted(true);

    const load = () => setProducts(getAllProducts());
    load();

    window.addEventListener("products-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("products-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  /* All unique categories + publishers (derived from LIVE products) */
  const allCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );
  const allPublishers = useMemo(
    () => Array.from(new Set(products.map((p) => p.publisher))),
    [products]
  );

  /* Filter + sort */
  const results = useMemo(() => {
    const q = initialQuery.trim().toLowerCase();

    let list = products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.publisher.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCategory =
        !filters.category || p.category === filters.category;
      const matchesPublisher =
        !filters.publisher || p.publisher === filters.publisher;
      const matchesPrice = minPrice(p) <= filters.maxPrice;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesPublisher &&
        matchesPrice
      );
    });

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => minPrice(b) - minPrice(a));
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, initialQuery, filters, sort]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function resetFilters() {
    setFilters({ category: null, publisher: null, maxPrice: 5000 });
  }

  return (
    <main className="mx-auto w-full px-4 py-8 md:px-6">
      {/* BACK */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Store
      </button>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 focus-within:border-cyan-400/40">
          <SearchIcon size={20} className="ml-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, gift cards, subscriptions..."
            className="w-full bg-transparent px-3 py-4 text-base text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="m-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            Search
          </button>
        </div>
      </form>

      {/* HEADER */}
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
          Search Results
        </p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">
          {initialQuery ? (
            <>
              &ldquo;{initialQuery}&rdquo;
              <span className="ml-2 text-base font-normal text-slate-500">
                ({results.length} result{results.length === 1 ? "" : "s"})
              </span>
            </>
          ) : (
            "All Products"
          )}
        </h1>
      </div>

      {/* LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* FILTERS */}
        <SearchFilters
          categories={allCategories}
          publishers={allPublishers}
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          mobileOpen={mobileFilters}
          onMobileClose={() => setMobileFilters(false)}
        />

        {/* RESULTS */}
        <div>
          {/* Sort + mobile filter */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <MobileFilterButton onClick={() => setMobileFilters(true)} />

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs font-bold uppercase tracking-wider text-slate-500 sm:inline">
                Sort:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-[#0f172a]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LOADING */}
          {!mounted ? (
            <div className="py-20 text-center">
              <p className="text-slate-500">Loading products...</p>
            </div>
          ) : results.length === 0 ? (
            /* EMPTY STATE */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan-400/10 text-cyan-400">
                <SearchIcon size={26} />
              </div>
              <h2 className="mt-4 text-xl font-black">No results found</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                We couldn&apos;t find anything matching your search or
                filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            /* RESULTS GRID */
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/topup/${product.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                      {/* Fallback initials — always behind image */}
                      <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/10">
                        {product.name.substring(0, 2)}
                      </div>

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

                      {product.discount && (
                        <div className="absolute left-3 top-3 rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-black text-black shadow-lg">
                          -{product.discount}%
                        </div>
                      )}
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
                          From {formatCurrency(minPrice(product))}
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

          {/* Suggestion */}
          {results.length > 0 && results.length < 3 && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-400">
              <Sparkles size={14} />
              <span className="font-semibold">
                Tip: Try searching for &quot;MLBB&quot;, &quot;diamonds&quot;,
                or &quot;OTT&quot; to explore more.
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full px-6 py-20 text-center">
          <p className="text-slate-500">Loading search...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}