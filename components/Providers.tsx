'use client';

import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 👇 Load Google script globally, but DO NOT trigger One Tap */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      {children}
    </SessionProvider>
  );
}