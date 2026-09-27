import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =========================================================
// 🛡️ MIDDLEWARE — Route Protection
// =========================================================
// This runs BEFORE every matched route loads. It's the
// first line of defense for admin pages.
//
// NOTE: Admin authentication is stored in localStorage
// (client-side), which is NOT accessible from middleware
// (server-side). So this middleware does a "best effort"
// check based on cookies/headers only.
//
// The real permission check still happens in each page's
// useEffect (via isAdminLoggedIn()). This middleware just
// provides an extra layer — including a cookie that we set
// at login time, which we CAN read here.
// =========================================================

const ADMIN_COOKIE_NAME = "marshal-admin-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =========================================================
  // 🛡️ Protect /admin/* routes
  // =========================================================
  if (pathname.startsWith("/admin")) {
    // Allow the login page itself
    if (pathname === "/admin/login") {
      // If already logged in (cookie exists), redirect to dashboard
      const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
      if (sessionCookie?.value === "active") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // For all other /admin/* routes, require the session cookie
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (sessionCookie?.value !== "active") {
      const loginUrl = new URL("/admin/login", request.url);
      // Remember where they wanted to go so we can send them back after login
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Only run middleware on these routes
export const config = {
  matcher: ["/admin/:path*"],
};