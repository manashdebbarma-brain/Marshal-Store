export type User = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  image?: string;
  provider: "google" | "phone";
  loggedInAt: string;
};

// ⚠️ This storage is only used as a UI cache. Real auth comes from NextAuth.
const USER_KEY = "marshal-store-user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setUser(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("user-updated"));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("marshal_user"); // clean up old key if present
  localStorage.removeItem("user");
  localStorage.removeItem("auth");
  window.dispatchEvent(new Event("user-updated"));
}

export function updateUserName(name: string) {
  const user = getUser();
  if (!user) return null;
  const updated: User = { ...user, name };
  setUser(updated);
  return updated;
}

/* =========================
   MOCK OTP (for phone demo only)
========================= */

export function sendOtp(phone: string): string {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  console.log(
    `%c📱 OTP for ${phone}: ${otp}`,
    "background:#00f2fe;color:#000;padding:4px 8px;border-radius:4px;font-weight:bold;"
  );
  return otp;
}

export function verifyOtp(input: string, expected: string): boolean {
  return input.trim() === expected;
}