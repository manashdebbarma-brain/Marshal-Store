"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  X,
  Check,
  Trash2,
} from "lucide-react";

import CartItem from "@/components/CartItem";
import { toast } from "@/components/Toast";
import {
  getCart,
  saveCart,
  removeFromCart,
  clearCart,
  type CartItem as CartItemType,
} from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { applyPromo, type PromoResult } from "@/lib/promo";
import { getUser } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";

const GST_RATE = 0.05;

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItemType[]>([]);
  const [mounted, setMounted] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // 🔐 Login gate
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    setMounted(true);

    function refresh() {
      setItems(getCart());
    }
    refresh();

    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  /* Recompute promo when subtotal changes */
  useEffect(() => {
    if (promo && promo.ok) {
      const subtotal = items.reduce(
        (sum, i) => sum + i.amount * i.quantity,
        0
      );
      const refreshed = applyPromo(promo.code, subtotal);
      setPromo(refreshed);
    }
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  /* After login modal closes, resume checkout if user is now logged in */
  useEffect(() => {
    if (showLoginModal) return;
    if (!pendingCheckout) return;

    const user = getUser();
    if (user) {
      doCheckout();
      setPendingCheckout(false);
    } else {
      setPendingCheckout(false);
    }
  }, [showLoginModal, pendingCheckout]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = items.reduce(
    (sum, i) => sum + i.amount * i.quantity,
    0
  );
  const discount = promo && promo.ok ? promo.discount : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const gst = Number((afterDiscount * GST_RATE).toFixed(2));
  const total = Number((afterDiscount + gst).toFixed(2));

  function handleQuantity(id: string, quantity: number) {
    if (quantity < 1 || quantity > 99) return;
    const next = items.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );
    saveCart(next);
  }

  function handleRemove(id: string) {
    removeFromCart(id);
    toast("Item removed from cart", "info");
  }

  function handleApplyPromo() {
    const result = applyPromo(promoInput, subtotal);
    if (result.ok) {
      setPromo(result);
      toast(`Promo "${result.code}" applied`, "success");
    } else {
      setPromo(null);
      toast(result.error, "error");
    }
  }

  function handleRemovePromo() {
    setPromo(null);
    setPromoInput("");
    toast("Promo removed", "info");
  }

  function handleClearCart() {
    clearCart();
    setConfirmClear(false);
    setPromo(null);
    setPromoInput("");
    toast("Cart cleared", "info");
  }

  // 🔐 Login-gated checkout
  function handleCheckout() {
    if (!items.length) return;

    const user = getUser();
    if (!user) {
      toast("Please login to proceed to checkout", "info");
      setPendingCheckout(true);
      setShowLoginModal(true);
      return;
    }

    doCheckout();
  }

  function doCheckout() {
    if (!items.length) return;

    if (items.length === 1) {
      const it = items[0];
      router.push(`/topup/${it.productSlug}`);
      return;
    }

    toast("Multi-item checkout coming soon", "info");
    const first = items[0];
    router.push(`/topup/${first.productSlug}`);
  }

  if (!mounted) {
    return (
      <main className="mx-auto w-full px-4 py-20 text-center">
        <p className="text-slate-500">Loading cart...</p>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto w-full px-4 py-8 md:px-6">
        {/* BACK */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Store
        </button>

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-400">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-black">My Cart</h1>
              <p className="text-sm text-slate-500">
                {items.length} item{items.length === 1 ? "" : "s"} in your cart
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/15"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center"
          >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-cyan-400/10 text-cyan-400">
              <ShoppingBag size={32} />
            </div>
            <h2 className="mt-4 text-xl font-black">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Browse our top-up categories and add some packages to get
              started.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
            >
              <ShoppingBag size={16} />
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* ITEMS */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    index={i}
                    onQuantityChange={handleQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* SUMMARY */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-xl font-black">Order Summary</h2>

                {/* Promo */}
                <div className="mt-5">
                  {promo && promo.ok ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-emerald-400" />
                        <div>
                          <p className="text-sm font-black text-emerald-400">
                            {promo.code}
                          </p>
                          <p className="text-xs text-emerald-400/80">
                            {promo.label}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="grid h-7 w-7 place-items-center rounded-lg text-emerald-400 transition hover:bg-emerald-400/20"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/5">
                        <Ticket
                          size={16}
                          className="ml-3 text-slate-500"
                        />
                        <input
                          value={promoInput}
                          onChange={(e) =>
                            setPromoInput(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyPromo()
                          }
                          placeholder="Enter promo code"
                          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-500"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/20"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary lines */}
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span className="font-semibold">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (5%)</span>
                    <span className="font-semibold">
                      {formatCurrency(gst)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-black text-cyan-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout */}
                <button
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-black text-black transition hover:scale-[1.02]"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-sm transition hover:bg-white/10"
                >
                  Continue Shopping
                </Link>

                {/* Available codes hint */}
                {!promo && (
                  <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Try these codes
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {["SAVE10", "WELCOME50", "FIRST100"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setPromoInput(c)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-mono font-bold transition hover:border-cyan-400/40 hover:text-cyan-400"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Clear Modal */}
        <AnimatePresence>
          {confirmClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setConfirmClear(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f172a] p-6"
              >
                <h3 className="text-lg font-black">Clear entire cart?</h3>
                <p className="mt-2 text-sm text-slate-400">
                  This will remove all items. You can&apos;t undo this.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex-1 rounded-xl bg-red-500 py-3 font-black text-white transition hover:scale-[1.02]"
                  >
                    Clear
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🔐 Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}