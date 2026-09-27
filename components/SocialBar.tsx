"use client";

import { Instagram, Youtube, MessageCircle } from "lucide-react";

export default function SocialBar() {
  return (
    <div className="fixed bottom-5 left-5 z-40 hidden items-center gap-3 rounded-full border border-white/10 bg-[#0a0f1d]/90 px-4 py-2 shadow-lg backdrop-blur md:flex">
      <span className="text-xs font-bold">Let&apos;s Team Up</span>

      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        className="text-pink-400 transition hover:scale-110"
      >
        <Instagram size={16} />
      </a>
      <a
        href="https://youtube.com"
        target="_blank"
        rel="noreferrer"
        className="text-red-500 transition hover:scale-110"
      >
        <Youtube size={16} />
      </a>
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noreferrer"
        className="text-green-500 transition hover:scale-110"
      >
        <MessageCircle size={16} />
      </a>
    </div>
  );
}