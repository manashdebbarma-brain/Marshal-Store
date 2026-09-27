export type StoredOrder = {
  orderId: string;
  productSlug: string;
  productName: string;
  packageName: string;
  playerId?: string;
  serverId?: string;
  subtotal: number;
  processingFee: number;
  total: number;
  paymentMethod: string;
  status:
    | "placed"
    | "received"
    | "processing"
    | "completed"
    | "cancelled";
  timestamp: string;
};

const ORDER_KEY = "marshal-store-orders";
const WALLET_KEY = "marshal-store-wallet";
const WALLET_HISTORY_KEY = "marshal-store-wallet-history";
const CART_KEY = "marshal-store-cart";

/* =========================
   ORDERS
========================= */

export function getOrders(): StoredOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  const data = localStorage.getItem(ORDER_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveOrder(order: StoredOrder) {
  const orders = getOrders();

  localStorage.setItem(
    ORDER_KEY,
    JSON.stringify([order, ...orders])
  );

  window.dispatchEvent(new Event("orders-updated"));
}

export function findOrder(query: string) {
  const orders = getOrders();

  const normalized = query.trim().toLowerCase();

  return orders.find(
    (order) =>
      order.orderId.toLowerCase() === normalized ||
      order.playerId?.toLowerCase() === normalized
  );
}

/**
 * ✅ NEW — Update the status of an existing order.
 * Fires `orders-updated` event so dashboards and
 * track-order page refresh live.
 */
export function updateOrderStatus(
  orderId: string,
  status: StoredOrder["status"]
): boolean {
  if (typeof window === "undefined") return false;

  const orders = getOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index === -1) return false;

  orders[index] = { ...orders[index], status };

  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("orders-updated"));
  return true;
}

/* =========================
   WALLET
========================= */

export type WalletTransaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  balanceAfter: number;
  timestamp: string;
};

export function getWalletBalance(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const storedBalance = localStorage.getItem(WALLET_KEY);

  if (!storedBalance) {
    return 0;
  }

  const balance = Number(storedBalance);

  if (!Number.isFinite(balance)) {
    return 0;
  }

  return Math.max(0, balance);
}

export function setWalletBalance(balance: number) {
  if (typeof window === "undefined") {
    return;
  }

  const safeBalance = Math.max(0, Number(balance) || 0);

  localStorage.setItem(WALLET_KEY, String(safeBalance));

  window.dispatchEvent(new Event("wallet-updated"));
}

/* =========================
   WALLET HISTORY
========================= */

export function getWalletTransactions(): WalletTransaction[] {
  if (typeof window === "undefined") {
    return [];
  }

  const data = localStorage.getItem(WALLET_HISTORY_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function generateWalletTransactionId() {
  return `WT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

function saveWalletTransaction(transaction: WalletTransaction) {
  if (typeof window === "undefined") {
    return;
  }

  const transactions = getWalletTransactions();

  localStorage.setItem(
    WALLET_HISTORY_KEY,
    JSON.stringify([transaction, ...transactions])
  );

  window.dispatchEvent(new Event("wallet-history-updated"));
}

/* =========================
   ADD WALLET BALANCE
========================= */

export function addWalletBalance(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return false;
  }

  const currentBalance = getWalletBalance();
  const newBalance = currentBalance + amount;

  setWalletBalance(newBalance);

  saveWalletTransaction({
    id: generateWalletTransactionId(),
    type: "credit",
    amount,
    description: "Wallet balance added",
    balanceAfter: newBalance,
    timestamp: new Date().toISOString(),
  });

  return true;
}

/* =========================
   DEDUCT WALLET BALANCE
========================= */

export function deductWalletBalance(
  amount: number,
  description = "Wallet purchase"
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return false;
  }

  const currentBalance = getWalletBalance();

  if (currentBalance < amount) {
    return false;
  }

  const newBalance = Number((currentBalance - amount).toFixed(2));

  /*
   * Save the reduced balance first.
   */
  localStorage.setItem(WALLET_KEY, String(newBalance));

  /*
   * Notify Navbar and other components.
   */
  window.dispatchEvent(new Event("wallet-updated"));

  /*
   * Save wallet transaction.
   */
  saveWalletTransaction({
    id: generateWalletTransactionId(),
    type: "debit",
    amount,
    description,
    balanceAfter: newBalance,
    timestamp: new Date().toISOString(),
  });

  return true;
}

/* =========================
   CART
========================= */

export type CartItem = {
  id: string;
  productSlug: string;
  productName: string;
  packageId: string;
  packageName: string;
  amount: number;
  quantity: number;
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const data = localStorage.getItem(CART_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existing = cart.find((cartItem) => cartItem.id === item.id);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item.id !== id);

  saveCart(cart);
}

export function clearCart() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CART_KEY);

  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}