"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import AdminLoginModal from "@/components/AdminLoginModal";

export default function Footer() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // ⌨️ Keyboard shortcut: Ctrl+Shift+A opens admin login
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShowAdminLogin(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <footer className="mt-20 border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          {/* TOP SECTION */}
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-black text-white">
                Marshal<span className="text-cyan-400">Store</span>
              </h3>
              <p className="mt-3 max-w-md text-sm text-slate-500">
                Your trusted destination for game top-ups, gift cards, and
                premium subscriptions — delivered instantly.
              </p>

              {/* Social icons */}
              <div className="mt-5 flex gap-3">
                {[
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Youtube, label: "YouTube" },
                  { Icon: MessageCircle, label: "WhatsApp" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Home", href: "/" },
                  { label: "Products", href: "/products" },
                  { label: "Track Order", href: "/track-order" },
                  { label: "Notifications", href: "/notifications" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 transition hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "My Account", href: "/account" },
                  { label: "Cart", href: "/cart" },
                  { label: "Help Center", href: "#" },
                  { label: "Contact Us", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 transition hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Marshal Store. All rights reserved.
            </p>

            {/* 🔐 ADMIN ACCESS BUTTON */}
            <button
              onClick={() => setShowAdminLogin(true)}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-cyan-400/40 hover:text-cyan-400"
            >
              <ShieldCheck size={12} />
              Admin Access
            </button>
          </div>
        </div>
      </footer>

      {/* 🔐 LOGIN POPUP */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </>
  );
}