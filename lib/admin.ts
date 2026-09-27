const ADMIN_KEY = "marshal-store-admin";
const ADMIN_SESSION_KEY = "marshal-store-admin-session";
const CUSTOM_ADMINS_KEY = "marshal-store-custom-admins";
const ADMIN_COOKIE_NAME = "marshal-admin-session";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours (in ms)

// =========================================================
// 🎭 ROLES
// =========================================================
export type AdminRole = "AUTHOR" | "PETITION";

// =========================================================
// 🎫 PERMISSIONS
// =========================================================
export type Permission =
  | "view_stats"
  | "view_products"
  | "manage_products"
  | "create_products"
  | "edit_products"
  | "delete_products"
  | "reset_products"
  | "view_orders"
  | "manage_orders"
  | "view_users"
  | "manage_users"
  | "manage_admins"
  | "manage_settings";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  AUTHOR: [
    "view_stats",
    "view_products",
    "manage_products",
    "create_products",
    "edit_products",
    "delete_products",
    "reset_products",
    "view_orders",
    "manage_orders",
    "view_users",
    "manage_users",
    "manage_admins",
    "manage_settings",
  ],
  PETITION: [
    "view_stats",
    "view_products",
    "manage_products",
    "create_products",
    "edit_products",
    "view_orders",
    "manage_orders",
    "view_users",
    "manage_users",
  ],
};

// =========================================================
// 👥 ADMIN ACCOUNT TYPE
// =========================================================
export interface AdminAccount {
  id: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  isDefault?: boolean;
}

// =========================================================
// 🔐 HASHING
// =========================================================
export function hashPassword(password: string): string {
  let hash = 0;
  const salted = `marshal_salt_${password}_secure_key`;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `marshal_${Math.abs(hash).toString(16)}`;
}

// =========================================================
// 🔐 COOKIE HELPERS
// =========================================================
function setAdminCookie() {
  if (typeof document === "undefined") return;
  const maxAge = SESSION_DURATION / 1000; // convert ms → seconds
  document.cookie = `${ADMIN_COOKIE_NAME}=active; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearAdminCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

// =========================================================
// 🔐 DEFAULT ADMIN LIST
// =========================================================
const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: "MAINADMIN200",
    name: "Manash",
    role: "AUTHOR",
    passwordHash: hashPassword("manash@2005"),
    isDefault: true,
  },
  {
    id: "MAINADMIN205",
    name: "Petition Admin",
    role: "PETITION",
    passwordHash: hashPassword("access@205"),
    isDefault: true,
  },
];

// =========================================================
// 🔐 CUSTOM ADMINS (localStorage)
// =========================================================
export function getCustomAdmins(): AdminAccount[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CUSTOM_ADMINS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveCustomAdmins(admins: AdminAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify(admins));
  window.dispatchEvent(new Event("admin-updated"));
}

export function getAllAdmins(): AdminAccount[] {
  return [...DEFAULT_ADMINS, ...getCustomAdmins()];
}

// =========================================================
// ➕ ADD / UPDATE / REMOVE
// =========================================================
export function addCustomAdmin(
  admin: Omit<AdminAccount, "isDefault">
): { ok: boolean; error?: string } {
  const all = getAllAdmins();
  const exists = all.find(
    (a) => a.id.toLowerCase() === admin.id.toLowerCase().trim()
  );
  if (exists) {
    return { ok: false, error: "This Admin ID is already taken" };
  }

  const custom = getCustomAdmins();
  const newAdmin: AdminAccount = { ...admin, isDefault: false };
  custom.push(newAdmin);
  saveCustomAdmins(custom);

  return { ok: true };
}

export function updateCustomAdmin(
  originalId: string,
  updated: Partial<AdminAccount>
): { ok: boolean; error?: string } {
  const isDefault = DEFAULT_ADMINS.some(
    (a) => a.id.toLowerCase() === originalId.toLowerCase()
  );
  if (isDefault) {
    return { ok: false, error: "Default admins cannot be edited" };
  }

  const custom = getCustomAdmins();
  const index = custom.findIndex(
    (a) => a.id.toLowerCase() === originalId.toLowerCase()
  );
  if (index === -1) {
    return { ok: false, error: "Admin not found" };
  }

  if (
    updated.id &&
    updated.id.toLowerCase() !== originalId.toLowerCase()
  ) {
    const all = getAllAdmins();
    const taken = all.find(
      (a) =>
        a.id.toLowerCase() === updated.id!.toLowerCase().trim() &&
        a.id.toLowerCase() !== originalId.toLowerCase()
    );
    if (taken) {
      return { ok: false, error: "This Admin ID is already taken" };
    }
  }

  custom[index] = { ...custom[index], ...updated };
  saveCustomAdmins(custom);

  return { ok: true };
}

export function removeCustomAdmin(adminId: string): {
  ok: boolean;
  error?: string;
} {
  const isDefault = DEFAULT_ADMINS.some(
    (a) => a.id.toLowerCase() === adminId.toLowerCase()
  );
  if (isDefault) {
    return { ok: false, error: "Default admins cannot be deleted" };
  }

  const session = getAdminSession();
  if (session && session.id.toLowerCase() === adminId.toLowerCase()) {
    return { ok: false, error: "You cannot delete your own account" };
  }

  const custom = getCustomAdmins();
  const filtered = custom.filter(
    (a) => a.id.toLowerCase() !== adminId.toLowerCase()
  );

  if (filtered.length === custom.length) {
    return { ok: false, error: "Admin not found" };
  }

  saveCustomAdmins(filtered);
  return { ok: true };
}

// =========================================================
// SESSION MANAGEMENT
// =========================================================
export interface AdminSession {
  id: string;
  name: string;
  role: AdminRole;
  createdAt: number;
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ADMIN_SESSION_KEY);

  // ✅ Cleanup stale cookie if no session exists
  if (!raw) {
    clearAdminCookie();
    return null;
  }

  try {
    const parsed: AdminSession = JSON.parse(raw);

    // ✅ Auto-logout on expired session
    if (Date.now() - parsed.createdAt > SESSION_DURATION) {
      adminLogout();
      return null;
    }

    // ✅ Ensure cookie is set (in case it got cleared but session survived)
    setAdminCookie();

    return parsed;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}

export function adminLogin(adminId: string, password: string): boolean {
  if (typeof window === "undefined") return false;

  const all = getAllAdmins();
  const admin = all.find(
    (a) => a.id.toLowerCase() === adminId.toLowerCase().trim()
  );
  if (!admin) return false;

  const inputHash = hashPassword(password);
  if (inputHash !== admin.passwordHash) return false;

  const session: AdminSession = {
    id: admin.id,
    name: admin.name,
    role: admin.role,
    createdAt: Date.now(),
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(ADMIN_KEY);

  // ✅ 3A — Set cookie so middleware can read it
  setAdminCookie();

  window.dispatchEvent(new Event("admin-updated"));
  return true;
}

export function adminLogout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_KEY);

  // ✅ 3B — Clear cookie on logout
  clearAdminCookie();

  window.dispatchEvent(new Event("admin-updated"));
}

// =========================================================
// 🛡️ PERMISSION HELPERS
// =========================================================
export function hasPermission(permission: Permission): boolean {
  const session = getAdminSession();
  if (!session) return false;
  return ROLE_PERMISSIONS[session.role].includes(permission);
}

export function getCurrentRole(): AdminRole | null {
  return getAdminSession()?.role ?? null;
}

export function isBoss(): boolean {
  return getCurrentRole() === "AUTHOR";
}