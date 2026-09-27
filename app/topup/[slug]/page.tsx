"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  ShoppingCart,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { paymentChannels } from "@/lib/mockData";
import { getAllProducts, AdminProduct } from "@/lib/productStore";
import { getUser } from "@/lib/auth";
import {
  addToCart,
  deductWalletBalance,
  getWalletBalance,
  saveOrder,
} from "@/lib/storage";
import { formatCurrency, generateOrderId } from "@/lib/utils";
import { toast } from "@/components/Toast";
import {
  notifyOrderPlaced,
  notifyWalletDebit,
} from "@/lib/notifications";

import LoginModal from "@/components/LoginModal";

type Step = 1 | 2 | 3 | 4;

export default function TopupPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [step, setStep] = useState<Step>(1);
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [cartMessage, setCartMessage] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletError, setWalletError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [product, setProduct] = useState<AdminProduct | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  // 🔐 Login gate state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "buy" | "addToCart" | null
  >(null);

  // Load product from live store
  useEffect(() => {
    setMounted(true);

    const load = () => {
      const all = getAllProducts();
      setProduct(all.find((item) => item.slug === slug));
    };

    load();

    window.addEventListener("products-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("products-updated", load);
      window.removeEventListener("storage", load);
    };
  }, [slug]);

  useEffect(() => {
    setImageFailed(false);
  }, [slug]);

  // Wallet
  useEffect(() => {
    setWalletBalance(getWalletBalance());
    function refreshWallet() {
      setWalletBalance(getWalletBalance());
    }
    window.addEventListener("wallet-updated", refreshWallet);
    return () => {
      window.removeEventListener("wallet-updated", refreshWallet);
    };
  }, []);

  // ✅ When login modal closes, check if user logged in → execute pending action
  useEffect(() => {
    if (showLoginModal) return; // Only check after modal closes
    if (!pendingAction) return;

    const user = getUser();
    if (user) {
      // User is now logged in — run the pending action
      if (pendingAction === "addToCart") {
        doAddToCart();
      } else if (pendingAction === "buy") {
        doBuyNow();
      }
      setPendingAction(null);
    }
  }, [showLoginModal, pendingAction]);

  if (!mounted) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-slate-500">Loading...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">Product Not Found</h1>
        <p className="mt-3 text-slate-500">
          The requested product could not be found.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black"
        >
          Back to Store
        </button>
      </main>
    );
  }

  const safeProduct = product;

  const selectedPackage = safeProduct.packages.find(
    (item) => item.id === selectedPackageId
  );

  const selectedPayment = paymentChannels.find(
    (item) => item.id === selectedPaymentId
  );

  const subtotal = selectedPackage?.amount || 0;
  const processingFee = selectedPayment
    ? Number(((subtotal * selectedPayment.fee) / 100).toFixed(2))
    : 0;
  const total = subtotal + processingFee;
  const isWalletPayment = selectedPayment?.id === "wallet";
  const walletHasEnough = walletBalance >= total;

  function canContinue() {
    if (step === 1 && !selectedPackage) return false;
    if (step === 2) {
      if (safeProduct.fields.playerId && !playerId.trim()) return false;
      if (safeProduct.fields.serverId && !serverId.trim()) return false;
    }
    if (step === 3 && !selectedPayment) return false;
    if (step === 3 && isWalletPayment && !walletHasEnough) return false;
    return true;
  }

  function nextStep() {
    setWalletError("");
    if (!canContinue()) {
      if (step === 3 && isWalletPayment && !walletHasEnough) {
        setWalletError("Insufficient wallet balance.");
        toast("Insufficient wallet balance", "error");
      }
      return;
    }
    if (step < 4) setStep((step + 1) as Step);
  }

  function previousStep() {
    setWalletError("");
    if (step > 1) setStep((step - 1) as Step);
  }

  // ==============================
  // 🔒 LOGIN-GATED ACTIONS
  // ==============================

  function handleAddToCart() {
    const user = getUser();
    if (!user) {
      toast("Please login to add items to cart", "info");
      setPendingAction("addToCart");
      setShowLoginModal(true);
      return;
    }
    doAddToCart();
  }

  function doAddToCart() {
    if (!selectedPackage) return;

    addToCart({
      id: `${safeProduct.slug}-${selectedPackage.id}`,
      productSlug: safeProduct.slug,
      productName: safeProduct.name,
      packageId: selectedPackage.id,
      packageName: selectedPackage.title,
      amount: selectedPackage.amount,
      quantity: 1,
    });

    setCartMessage(true);
    toast(`${selectedPackage.title} added to cart`, "success");
    setTimeout(() => setCartMessage(false), 2500);
  }

  function handleBuyNow() {
    const user = getUser();
    if (!user) {
      toast("Please login to complete your purchase", "info");
      setPendingAction("buy");
      setShowLoginModal(true);
      return;
    }
    doBuyNow();
  }

  function doBuyNow() {
    setWalletError("");
    if (!selectedPackage || !selectedPayment) return;

    if (selectedPayment.id === "wallet") {
      const currentBalance = getWalletBalance();

      if (currentBalance < total) {
        setWalletError(
          `Insufficient wallet balance. Available: ${formatCurrency(
            currentBalance
          )}. Required: ${formatCurrency(total)}.`
        );
        toast("Insufficient wallet balance", "error");
        return;
      }

      const ok = deductWalletBalance(
        total,
        `${safeProduct.name} - ${selectedPackage.title}`
      );

      if (!ok) {
        setWalletError(
          "Wallet payment failed. Your balance was not deducted."
        );
        toast("Wallet payment failed", "error");
        return;
      }

      const updatedBalance = getWalletBalance();
      setWalletBalance(updatedBalance);

      if (updatedBalance >= currentBalance) {
        setWalletError(
          "Payment could not be completed because the wallet balance was not reduced."
        );
        toast("Payment failed", "error");
        return;
      }

      toast(
        `${formatCurrency(total)} deducted. New balance: ${formatCurrency(
          updatedBalance
        )}`,
        "success"
      );

      notifyWalletDebit(total);
    }

    const orderId = generateOrderId();

    saveOrder({
      orderId,
      productSlug: safeProduct.slug,
      productName: safeProduct.name,
      packageName: selectedPackage.title,
      playerId: playerId || undefined,
      serverId: serverId || undefined,
      subtotal,
      processingFee,
      total,
      paymentMethod: selectedPayment.name,
      status: "placed",
      timestamp: new Date().toISOString(),
    });

    notifyOrderPlaced(orderId, safeProduct.name, selectedPackage.title);

    router.push(`/transaction/${orderId}`);
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Store
        </button>

        {/* HERO */}
        <div className="glass overflow-hidden rounded-3xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white/10">
              {safeProduct.name.substring(0, 2)}
            </div>

            {!imageFailed && (
              <img
                src={`/games/${safeProduct.slug}.jpg`}
                alt={safeProduct.name}
                className="relative h-full w-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  const cleanSrc = img.src.split("?")[0];

                  if (cleanSrc.endsWith(".jpg")) {
                    img.src = `/games/${safeProduct.slug}.jpeg`;
                  } else if (cleanSrc.endsWith(".jpeg")) {
                    img.src = `/games/${safeProduct.slug}.png`;
                  } else if (cleanSrc.endsWith(".png")) {
                    img.src = `/games/${safeProduct.slug}.webp`;
                  } else {
                    setImageFailed(true);
                  }
                }}
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {typeof safeProduct.discount === "number" &&
              safeProduct.discount > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-cyan-400 px-3 py-1.5 text-sm font-black text-black shadow-lg">
                  -{safeProduct.discount}% OFF
                </div>
              )}

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 md:text-sm">
                {safeProduct.category}
              </p>
              <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
                {safeProduct.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                {safeProduct.description}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                by {safeProduct.publisher}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="glass rounded-3xl p-6 md:p-8">
            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-black">Select Package</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose the package you want to purchase.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {safeProduct.packages.map((item) => {
                    const selected = selectedPackageId === item.id;
                    const outOfStock =
                      "outOfStock" in item && item.outOfStock === true;
                    const bonus =
                      "bonus" in item ? item.bonus : undefined;
                    const popular =
                      "popular" in item ? item.popular : false;

                    return (
                      <motion.button
                        key={item.id}
                        whileHover={outOfStock ? {} : { y: -4 }}
                        whileTap={outOfStock ? {} : { scale: 0.98 }}
                        disabled={outOfStock}
                        onClick={() =>
                          !outOfStock && setSelectedPackageId(item.id)
                        }
                        className={`group relative flex flex-col rounded-2xl border p-4 text-center transition ${
                          outOfStock
                            ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60"
                            : selected
                            ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20"
                            : "border-white/10 bg-white/[0.03] hover:border-cyan-400/40"
                        }`}
                      >
                        {popular && !outOfStock && (
                          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-yellow-400 text-black shadow-md">
                            <Zap size={12} className="fill-black" />
                          </span>
                        )}

                        {selected && !outOfStock && (
                          <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-cyan-400 text-black">
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}

                        <div className="mx-auto mt-2 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-400/10 text-3xl">
                          <img
                            src="/diamond.jpg"
                            alt=""
                            className="h-9 w-9 object-contain"
                            onError={(e) => {
                              const el =
                                e.currentTarget as HTMLImageElement;
                              el.style.display = "none";
                              el.parentElement!.innerHTML = "💎";
                            }}
                          />
                        </div>

                        <p className="mt-3 text-sm font-black leading-tight">
                          {item.title}
                        </p>

                        {bonus && (
                          <p className="mt-1 text-[11px] font-bold text-emerald-400">
                            {String(bonus)}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-center gap-2">
                          <span className="text-lg font-black text-cyan-400">
                            ₹{item.amount}
                          </span>
                        </div>

                        <div
                          className={`mt-3 rounded-lg border py-1.5 text-xs font-bold transition ${
                            selected
                              ? "border-cyan-400 bg-cyan-400 text-black"
                              : "border-cyan-400/40 text-cyan-400 group-hover:bg-cyan-400/10"
                          }`}
                        >
                          {outOfStock
                            ? "Unavailable"
                            : selected
                            ? "Selected"
                            : "Select"}
                        </div>

                        {outOfStock && (
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-red-500 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                            Out of Stock
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-black">
                  Enter Account Details
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Enter the details required to deliver your digital product.
                </p>

                <div className="mt-8 space-y-5">
                  {safeProduct.fields.playerId && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Player ID
                      </label>
                      <input
                        value={playerId}
                        onChange={(event) =>
                          setPlayerId(event.target.value)
                        }
                        placeholder="Enter your Player ID"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50"
                      />
                    </div>
                  )}

                  {safeProduct.fields.serverId && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Server ID
                      </label>
                      <input
                        value={serverId}
                        onChange={(event) =>
                          setServerId(event.target.value)
                        }
                        placeholder="Enter your Server ID"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50"
                      />
                    </div>
                  )}

                  {!safeProduct.fields.playerId &&
                    !safeProduct.fields.serverId && (
                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-400">
                        No account information is required for this product.
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-black">
                  Select Payment Method
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose how you want to pay.
                </p>

                <div className="mt-8 space-y-3">
                  {paymentChannels.map((payment) => {
                    const selected = selectedPaymentId === payment.id;

                    return (
                      <button
                        key={payment.id}
                        onClick={() => {
                          setSelectedPaymentId(payment.id);
                          setWalletError("");
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-cyan-400 bg-cyan-400/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                            {payment.id === "upi" && (
                              <Smartphone
                                size={20}
                                className="text-cyan-400"
                              />
                            )}
                            {payment.id === "wallet" && (
                              <Wallet
                                size={20}
                                className="text-cyan-400"
                              />
                            )}
                            {payment.id === "card" && (
                              <CreditCard
                                size={20}
                                className="text-cyan-400"
                              />
                            )}
                            {payment.id === "netbanking" && (
                              <CreditCard
                                size={20}
                                className="text-cyan-400"
                              />
                            )}
                            {payment.id === "crypto" && (
                              <Wallet
                                size={20}
                                className="text-cyan-400"
                              />
                            )}
                          </div>

                          <div>
                            <p className="font-bold">{payment.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Processing fee: {payment.fee}%
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(
                              subtotal + (subtotal * payment.fee) / 100
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isWalletPayment && (
                  <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet size={20} className="text-cyan-400" />
                        <div>
                          <p className="text-sm font-bold">
                            Wallet Balance
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Available balance
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-cyan-400">
                        {formatCurrency(walletBalance)}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-sm">
                      <span className="text-slate-500">
                        Amount required
                      </span>
                      <span className="font-bold">
                        {formatCurrency(total)}
                      </span>
                    </div>

                    {!walletHasEnough && (
                      <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-400">
                        Insufficient wallet balance. Please add more
                        balance before continuing.
                      </div>
                    )}

                    {walletHasEnough && (
                      <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-400">
                        Your wallet balance is sufficient for this
                        purchase.
                      </div>
                    )}
                  </div>
                )}

                {walletError && (
                  <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-400">
                    {walletError}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-black">Confirm Your Order</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Review your order before making the payment.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-500">Product</span>
                    <span className="text-right text-sm font-semibold">
                      {safeProduct.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-500">Package</span>
                    <span className="text-right text-sm font-semibold">
                      {selectedPackage?.title}
                    </span>
                  </div>

                  {playerId && (
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                      <span className="text-sm text-slate-500">
                        Player ID
                      </span>
                      <span className="font-semibold">{playerId}</span>
                    </div>
                  )}

                  {serverId && (
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                      <span className="text-sm text-slate-500">
                        Server ID
                      </span>
                      <span className="font-semibold">{serverId}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-500">
                      Payment Method
                    </span>
                    <span className="text-right font-semibold">
                      {selectedPayment?.name}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Processing Fee
                    </span>
                    <span>{formatCurrency(processingFee)}</span>
                  </div>

                  <div className="flex justify-between border-t border-white/10 pt-4">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-black text-cyan-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* NAV BUTTONS */}
            <div className="mt-8 flex gap-3 border-t border-white/10 pt-6">
              {step > 1 && (
                <button
                  onClick={previousStep}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
                >
                  Back
                </button>
              )}

              {step < 4 && (
                <button
                  onClick={nextStep}
                  disabled={!canContinue()}
                  className="ml-auto rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-black">Order Summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Product</span>
                  <span className="text-right text-sm font-semibold">
                    {safeProduct.name}
                  </span>
                </div>

                {selectedPackage && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Package
                    </span>
                    <span className="text-right text-sm font-semibold">
                      {selectedPackage.title}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {selectedPayment && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Processing Fee
                    </span>
                    <span>{formatCurrency(processingFee)}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-black text-cyan-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {isWalletPayment && (
                <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Wallet Balance
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                      {formatCurrency(walletBalance)}
                    </span>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedPackage}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-bold text-cyan-400 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>

                  {cartMessage && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-center text-sm font-semibold text-emerald-400">
                      Added to cart successfully!
                    </div>
                  )}

                  {walletError && (
                    <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm font-semibold text-red-400">
                      {walletError}
                    </div>
                  )}

                  <button
                    onClick={handleBuyNow}
                    disabled={
                      !selectedPackage ||
                      !selectedPayment ||
                      (isWalletPayment && !walletHasEnough)
                    }
                    className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Buy Now
                  </button>

                  <button
                    onClick={() => router.push("/cart")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
                  >
                    <ShoppingCart size={17} />
                    View Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🔐 Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}