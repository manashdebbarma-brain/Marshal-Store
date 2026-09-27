export type NotificationType = "order" | "promo" | "system" | "wallet";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionHref?: string;
};

const KEY = "marshal-store-notifications";

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveAll(items: AppNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("notifications-updated"));
}

export function addNotification(
  input: Omit<AppNotification, "id" | "read" | "timestamp">
) {
  const item: AppNotification = {
    ...input,
    id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    timestamp: new Date().toISOString(),
  };
  const existing = getNotifications();
  saveAll([item, ...existing]);
  return item;
}

export function markAsRead(id: string) {
  const items = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveAll(items);
}

export function markAllAsRead() {
  const items = getNotifications().map((n) => ({ ...n, read: true }));
  saveAll(items);
}

export function deleteNotification(id: string) {
  const items = getNotifications().filter((n) => n.id !== id);
  saveAll(items);
}

export function clearAll() {
  saveAll([]);
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function seedWelcome() {
  if (typeof window === "undefined") return;
  const items = getNotifications();
  const alreadySeeded = items.some((n) => n.id === "welcome");
  if (alreadySeeded) return;
  const welcome: AppNotification = {
    id: "welcome",
    type: "system",
    title: "Welcome to Marshal Store 🎮",
    message:
      "Explore top-ups, gift cards and OTT subscriptions. Use wallet to pay instantly!",
    read: false,
    timestamp: new Date().toISOString(),
  };
  saveAll([welcome, ...items]);
}

export function notifyOrderPlaced(
  orderId: string,
  productName: string,
  packageName: string
) {
  addNotification({
    type: "order",
    title: "Order placed",
    message: `${productName} — ${packageName} (Order #${orderId})`,
    actionHref: `/transaction?orderId=${orderId}`,
  });
}

export function notifyWalletCredit(amount: number) {
  addNotification({
    type: "wallet",
    title: "Wallet topped up",
    message: `₹${amount} added to your Marshal Wallet`,
    actionHref: "/wallet",
  });
}

export function notifyWalletDebit(amount: number) {
  addNotification({
    type: "wallet",
    title: "Payment successful",
    message: `₹${amount} deducted from your wallet`,
    actionHref: "/wallet",
  });
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}