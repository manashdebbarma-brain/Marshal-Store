export type User = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  provider: "google" | "phone";
  loggedInAt: string;
};

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
  window.dispatchEvent(new Event("user-updated"));
}

/* =========================
   MOCK LOGIN PROVIDERS
========================= */

export function loginWithGoogle(name = "Acer"): User {
  const user: User = {
    id: `G-${Date.now()}`,
    name,
    email: `${name.toLowerCase()}@gmail.com`,
    provider: "google",
    loggedInAt: new Date().toISOString(),
  };

  setUser(user);
  return user;
}

export function loginWithPhone(
  phone: string,
  name = "Acer"
): User {
  const user: User = {
    id: `P-${Date.now()}`,
    name,
    phone,
    provider: "phone",
    loggedInAt: new Date().toISOString(),
  };

  setUser(user);
  return user;
}

/* =========================
   MOCK OTP
========================= */

/**
 * In a real app this hits your backend.
 * For demo purposes we generate a 6-digit code
 * and log it to the console so you can test.
 */
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
export function updateUserName(name: string) {
  const user = getUser();
  if (!user) return null;

  const updated: User = { ...user, name };
  setUser(updated);
  return updated;
}