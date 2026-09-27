"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { categories } from "@/lib/mockData";
import { getAllProducts, AdminProduct } from "@/lib/productStore";
import { getCartCount, getWalletBalance } from "@/lib/storage";
import { getUser, type User as UserType } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { seedWelcome } from "@/lib/notifications";
import { initializeTheme } from "@/lib/theme";

import LoginModal from "@/components/LoginModal";
import UserMenu from "@/components/UserMenu";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // ✅ Live products
  const [products, setProducts] = useState<AdminProduct[]>([]);

  // Dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs for click-outside
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const categoryWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeTheme();
    seedWelcome();

    function refreshNavbar() {
      setCartCount(getCartCount());
      setWalletBalance(getWalletBalance());
      setUser(getUser());
      setProducts(getAllProducts());
    }

    refreshNavbar();

    window.addEventListener("storage", refreshNavbar);
    window.addEventListener("cart-updated", refreshNavbar);
    window.addEventListener("wallet-updated", refreshNavbar);
    window.addEventListener("user-updated", refreshNavbar);
    window.addEventListener("products-updated", refreshNavbar);

    return () => {
      window.removeEventListener("storage", refreshNavbar);
      window.removeEventListener("cart-updated", refreshNavbar);
      window.removeEventListener("wallet-updated", refreshNavbar);
      window.removeEventListener("user-updated", refreshNavbar);
      window.removeEventListener("products-updated", refreshNavbar);
    };
  }, []);

  // ✅ Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        categoryWrapperRef.current &&
        !categoryWrapperRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Smarter search ranking
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const scored = products
      .map((p) => {
        const name = p.name.toLowerCase();
        const publisher = p.publisher.toLowerCase();
        const category = p.category.toLowerCase();
        const description = p.description.toLowerCase();

        let score = 0;

        // Exact name match
        if (name === q) score += 100;

        // Name starts with query
        else if (name.startsWith(q)) score += 80;

        // Any word in name starts with query
        else if (
          name.split(/\s+/).some((word) => word.startsWith(q))
        )
          score += 60;

        // Name includes query
        else if (name.includes(q)) score += 40;

        // Publisher/category match
        else if (
          publisher.includes(q) ||
          category.includes(q)
        )
          score += 20;

        // Description includes (weakest)
        else if (description.includes(q)) score += 5;

        return { product: p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => r.product);

    return scored;
  }, [search, products]);

  // Show dropdown only when typing AND results exist
  useEffect(() => {
    setShowDropdown(search.trim().length > 0);
  }, [search]);

  function handleSearchSubmit() {
    const query = search.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearch("");
    setShowDropdown(false);
    setMobileOpen(false);
  }

  function handleSelectProduct(slug: string) {
    router.push(`/topup/${slug}`);
    setSearch("");
    setShowDropdown(false);
  }

  function openCategory(id: number) {
    router.push(`/?parentId=${id}`);
    setCategoryOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f1d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
          {/* LOGO */}
          <button
            onClick={() => router.push("/")}
            className="flex shrink-0 items-center gap-2"
          >
            <img
              src="/logo.png"
              alt="Marshal Store"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display =
                  "none";
              }}
            />
            <span className="hidden text-xl font-black tracking-tight sm:inline">
              Marshal<span className="text-cyan-400">Store</span>
            </span>
          </button>

          {/* Desktop Search */}
          <div
            ref={searchWrapperRef}
            className="relative hidden flex-1 md:block"
          >
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
              <Search size={18} className="ml-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim().length > 0) setShowDropdown(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                placeholder="Search games, gift cards..."
                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            {/* ✅ Animated Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      No results for &ldquo;{search}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <>
                    {searchResults.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProduct(p.slug)}
                        className={`flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${
                          i === 0 ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
                            <img
                              src={`/games/${p.slug}.jpg`}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const img =
                                  e.currentTarget as HTMLImageElement;
                                img.style.display = "none";
                                const parent = img.parentElement!;
                                if (!parent.dataset.initialed) {
                                  parent.dataset.initialed = "1";
                                  parent.innerHTML = `<span style="font-size:12px;font-weight:900;color:rgba(255,255,255,0.3)">${p.name.substring(0, 2)}</span>`;
                                }
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {p.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {p.publisher} · {p.category}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-cyan-400">
                          View
                        </span>
                      </button>
                    ))}

                    <button
                      onClick={handleSearchSubmit}
                      className="w-full border-t border-white/5 bg-cyan-400/5 px-4 py-3 text-center text-xs font-bold text-cyan-400 transition hover:bg-cyan-400/10"
                    >
                      View all results for &ldquo;{search}&rdquo; →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Categories */}
            <div ref={categoryWrapperRef} className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Categories
                <ChevronDown
                  size={15}
                  className={
                    categoryOpen ? "rotate-180 transition" : "transition"
                  }
                />
              </button>

              {categoryOpen && (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => openCategory(cat.id)}
                      className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <p className="text-sm font-bold text-white">
                        {cat.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {cat.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/track-order")}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Track Order
            </button>

            <ThemeToggle />

            <button
              onClick={() => router.push("/wallet")}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
            >
              <Wallet size={16} className="text-cyan-400" />
              <div className="leading-none">
                <p className="text-[10px] text-slate-500">Wallet</p>
                <p className="mt-1 text-xs font-bold text-white">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
            </button>

            <NotificationsDropdown />

            <button
              onClick={() => router.push("/cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/5 px-3 py-2 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/10"
              >
                <User size={15} />
                Login
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <ThemeToggle />

            <NotificationsDropdown />

            <button
              onClick={() => router.push("/wallet")}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"
            >
              <Wallet size={17} className="text-cyan-400" />
              <span className="text-xs font-bold text-white">
                {formatCurrency(walletBalance)}
              </span>
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#0a0f1d] px-4 py-4 lg:hidden">
            <div className="mb-3 flex items-center rounded-xl border border-white/10 bg-white/5">
              <Search size={16} className="ml-3 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearchSubmit()
                }
                placeholder="Search games, gift cards..."
                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="mb-3">
              {user ? (
                <div className="flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email || `+91 ${user.phone}`}
                    </p>
                  </div>
                  <UserMenu />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLoginOpen(true);
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-xl bg-cyan-400 py-3 font-black text-black"
                >
                  Login / Sign Up
                </button>
              )}
            </div>

            <button
              onClick={() => {
                router.push("/track-order");
                setMobileOpen(false);
              }}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
            >
              Track Order
            </button>

            <p className="px-4 pt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Categories
            </p>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => openCategory(cat.id)}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}