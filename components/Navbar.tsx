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
import { useSession, signOut } from "next-auth/react";

import { categories } from "@/lib/mockData";
import { getAllProducts, AdminProduct } from "@/lib/productStore";
import { getCartCount, getWalletBalance } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { seedWelcome } from "@/lib/notifications";
import { initializeTheme } from "@/lib/theme";
import { clearUser } from "@/lib/auth";

import LoginModal from "@/components/LoginModal";
import UserMenu from "@/components/UserMenu";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ Real user comes from NextAuth session
  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || "",
      }
    : null;

  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const categoryWrapperRef = useRef<HTMLDivElement>(null);

  // ═══════════════════════════════════════════════════════════
  // 📧 EMAIL TRIGGERS
  // 1. Welcome email  — once per user, forever
  // 2. Login-success  — once per browser tab session
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const email = session?.user?.email;
    const name = session?.user?.name;

    if (!email || !name) return;

    // ─────────────────────────────────────────────
    // 1️⃣ Welcome email — once per user, forever
    // ─────────────────────────────────────────────
    const welcomeKey = `welcome-sent-${email}`;
    if (!localStorage.getItem(welcomeKey)) {
      localStorage.setItem(welcomeKey, "true");
      fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, type: "welcome" }),
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem(welcomeKey);
            console.warn("Welcome email failed — will retry next visit");
          } else {
            console.log(`✅ Welcome email sent to ${email}`);
          }
        })
        .catch((err) => {
          localStorage.removeItem(welcomeKey);
          console.error("Welcome email fetch failed:", err);
        });
    }

    // ─────────────────────────────────────────────
    // 2️⃣ Login-success email — once per tab session
    // ─────────────────────────────────────────────
    const loginKey = `login-notified-${email}`;
    if (!sessionStorage.getItem(loginKey)) {
      sessionStorage.setItem(loginKey, "true");
      fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, type: "login-success" }),
      })
        .then((res) => {
          if (res.ok) {
            console.log(`✅ Login-success email sent to ${email}`);
          } else {
            sessionStorage.removeItem(loginKey);
          }
        })
        .catch((err) => {
          sessionStorage.removeItem(loginKey);
          console.error("Login-success email fetch failed:", err);
        });
    }
  }, [session]);

  // Clean up any legacy fake user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("marshal-store-user");
      localStorage.removeItem("marshal_user");
    }
  }, []);

  useEffect(() => {
    initializeTheme();
    seedWelcome();

    function refreshNavbar() {
      setCartCount(getCartCount());
      setWalletBalance(getWalletBalance());
      setProducts(getAllProducts());
    }

    refreshNavbar();

    window.addEventListener("storage", refreshNavbar);
    window.addEventListener("cart-updated", refreshNavbar);
    window.addEventListener("wallet-updated", refreshNavbar);
    window.addEventListener("products-updated", refreshNavbar);

    return () => {
      window.removeEventListener("storage", refreshNavbar);
      window.removeEventListener("cart-updated", refreshNavbar);
      window.removeEventListener("wallet-updated", refreshNavbar);
      window.removeEventListener("products-updated", refreshNavbar);
    };
  }, []);

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

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return products
      .map((p) => {
        const name = p.name.toLowerCase();
        const publisher = p.publisher.toLowerCase();
        const category = p.category.toLowerCase();
        const description = p.description.toLowerCase();

        let score = 0;
        if (name === q) score += 100;
        else if (name.startsWith(q)) score += 80;
        else if (name.split(/\s+/).some((word) => word.startsWith(q))) score += 60;
        else if (name.includes(q)) score += 40;
        else if (publisher.includes(q) || category.includes(q)) score += 20;
        else if (description.includes(q)) score += 5;

        return { product: p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => r.product);
  }, [search, products]);

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

  // ✅ Real sign-out
  async function handleSignOut() {
    try {
      clearUser();
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b transition-colors
                         bg-white/95 dark:bg-[#0a0f1d]/90
                         border-slate-200 dark:border-white/10
                         backdrop-blur-xl">
        <div className="flex h-16 w-full items-center gap-4 px-4 md:px-6 lg:px-10">

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
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="hidden text-xl font-black tracking-tight sm:inline text-black dark:text-white">
              Marshal<span className="text-cyan-400">Store</span>
            </span>
          </button>

          {/* Desktop Search */}
          <div ref={searchWrapperRef} className="relative hidden flex-1 md:block">
            <div className="flex items-center rounded-xl border transition-colors
                            border-slate-200 dark:border-white/10
                            bg-slate-100 dark:bg-white/5">
              <Search size={18} className="ml-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim().length > 0) setShowDropdown(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                placeholder="Search games, gift cards..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none
                           text-black dark:text-white
                           placeholder:text-slate-500"
              />
            </div>

            {showDropdown && (
              <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border shadow-2xl
                              border-slate-200 dark:border-white/10
                              bg-white dark:bg-[#111827]">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm font-semibold text-slate-500">
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
                        className={`flex w-full items-center justify-between border-b px-4 py-3 text-left transition
                                    border-slate-100 dark:border-white/5
                                    hover:bg-slate-50 dark:hover:bg-white/5 ${
                          i === 0 ? "bg-slate-50/50 dark:bg-white/[0.02]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg
                                          bg-gradient-to-br from-slate-200 to-slate-300
                                          dark:from-slate-800 dark:to-slate-900">
                            <img
                              src={`/games/${p.slug}.jpg`}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
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
                            <p className="text-sm font-bold text-black dark:text-white">
                              {p.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {p.publisher} · {p.category}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-cyan-500">
                          View
                        </span>
                      </button>
                    ))}

                    <button
                      onClick={handleSearchSubmit}
                      className="w-full border-t px-4 py-3 text-center text-xs font-bold text-cyan-500 transition
                                 border-slate-100 dark:border-white/5
                                 bg-cyan-400/5 hover:bg-cyan-400/10"
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
            <div ref={categoryWrapperRef} className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition
                           text-slate-700 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-white/5
                           hover:text-black dark:hover:text-white"
              >
                Categories
                <ChevronDown
                  size={15}
                  className={categoryOpen ? "rotate-180 transition" : "transition"}
                />
              </button>

              {categoryOpen && (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border p-2 shadow-2xl
                                border-slate-200 dark:border-white/10
                                bg-white dark:bg-[#111827]">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => openCategory(cat.id)}
                      className="w-full rounded-xl px-4 py-3 text-left transition
                                 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <p className="text-sm font-bold text-black dark:text-white">
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
              className="rounded-xl px-3 py-2 text-sm font-semibold transition
                         text-slate-700 dark:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-white/5
                         hover:text-black dark:hover:text-white"
            >
              Track Order
            </button>

            <ThemeToggle />

            <button
              onClick={() => router.push("/wallet")}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 transition
                         border-slate-200 dark:border-white/10
                         bg-slate-100 dark:bg-white/5
                         hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <Wallet size={16} className="text-cyan-500" />
              <div className="leading-none">
                <p className="text-[10px] text-slate-500">Wallet</p>
                <p className="mt-1 text-xs font-bold text-black dark:text-white">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
            </button>

            <NotificationsDropdown />

            <button
              onClick={() => router.push("/cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition
                         border-slate-200 dark:border-white/10
                         bg-slate-100 dark:bg-white/5
                         hover:bg-slate-200 dark:hover:bg-white/10
                         text-black dark:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* ✅ Real user display */}
            {status === "loading" ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-white/5" />
            ) : user ? (
              <UserMenu
                user={{
                  name: user.name,
                  email: user.email,
                  image: user.image,
                }}
                onSignOut={handleSignOut}
              />
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold text-cyan-500 transition
                           border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/10"
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
              className="flex h-10 items-center gap-2 rounded-xl border px-3
                         border-slate-200 dark:border-white/10
                         bg-slate-100 dark:bg-white/5"
            >
              <Wallet size={17} className="text-cyan-500" />
              <span className="text-xs font-bold text-black dark:text-white">
                {formatCurrency(walletBalance)}
              </span>
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border
                         border-slate-200 dark:border-white/10
                         bg-slate-100 dark:bg-white/5
                         text-black dark:text-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border
                         border-slate-200 dark:border-white/10
                         bg-slate-100 dark:bg-white/5
                         text-black dark:text-white"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t px-4 py-4 lg:hidden
                          border-slate-200 dark:border-white/10
                          bg-white dark:bg-[#0a0f1d]">
            <div className="mb-3 flex items-center rounded-xl border
                            border-slate-200 dark:border-white/10
                            bg-slate-100 dark:bg-white/5">
              <Search size={16} className="ml-3 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                placeholder="Search games, gift cards..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none
                           text-black dark:text-white
                           placeholder:text-slate-500"
              />
            </div>

            <div className="mb-3">
              {status === "loading" ? (
                <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
              ) : user ? (
                <div className="flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-black dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <UserMenu
                    user={{
                      name: user.name,
                      email: user.email,
                      image: user.image,
                    }}
                    onSignOut={handleSignOut}
                  />
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
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold
                         hover:bg-slate-100 dark:hover:bg-white/5
                         text-black dark:text-white"
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
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold
                           hover:bg-slate-100 dark:hover:bg-white/5
                           text-black dark:text-white"
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