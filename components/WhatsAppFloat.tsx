"use client";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/919863106464"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 transition hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7"
      >
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.6 6.3 1.6h.1c6.6 0 12-5.4 12-12S22.6 3 16 3zm6.9 17c-.3.8-1.7 1.6-2.3 1.7-.6.1-1.3.1-2.1-.2-1.5-.6-3.2-1.9-4.5-3.4-1-1.1-1.8-2.3-2.2-3.4-.3-.8-.3-1.6 0-2.3.3-.5.9-1.2 1.3-1.4.3-.2.6-.2.9-.2.2 0 .5 0 .7.1.3.1.5.1.6.6.2.5.8 2.1.9 2.3.1.2.1.4 0 .6-.1.2-.2.4-.5.6-.2.3-.5.5-.7.7-.2.2-.4.4-.2.7.3.5.8 1.2 1.4 1.7.7.6 1.3 1 2 1.3.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.8.8 2.1 1 .3.1.5.2.5.3.1.4.1.8-.1 1.4z" />
      </svg>
    </a>
  );
}