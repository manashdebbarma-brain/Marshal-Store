"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Package, Wallet, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onSignOut?: () => void | Promise<void>;
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition
                   border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/10"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={displayName}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">
            {initial}
          </span>
        )}
        <span className="hidden text-sm font-bold text-cyan-500 sm:inline">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border shadow-2xl
                        border-slate-200 dark:border-white/10
                        bg-white dark:bg-[#111827]">
          <div className="border-b px-4 py-3 border-slate-100 dark:border-white/5">
            <p className="text-sm font-bold text-black dark:text-white">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/orders");
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm transition
                       text-slate-700 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Package size={15} />
            My Orders
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/wallet");
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm transition
                       text-slate-700 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Wallet size={15} />
            Wallet
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm transition
                       text-slate-700 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <UserIcon size={15} />
            Profile
          </button>

          <button
            onClick={async () => {
              setOpen(false);
              if (onSignOut) await onSignOut();
            }}
            className="flex w-full items-center gap-2 border-t px-4 py-3 text-sm font-semibold text-rose-500 transition
                       border-slate-100 dark:border-white/5
                       hover:bg-rose-500/10"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}