import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SocialBar from "@/components/SocialBar";
import ToastContainer from "@/components/Toast";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import WelcomePopup from "@/components/WelcomePopup";
import Providers from "@/components/Providers"; // 👈 ADDED

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Marshal Store — Instant Game Top-Ups",
  description:
    "Instant game top-ups, gift cards and digital subscriptions. Fast, secure, 24/7.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Marshal Store — Instant Game Top-Ups",
    description:
      "Buy game diamonds, UC, vouchers, and subscriptions with instant delivery.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* 👇 SessionProvider wraps everything so useSession() works everywhere */}
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* Footer with Admin Access button */}
          <Footer />

          <WhatsAppFloat />
          <SocialBar />
          <ToastContainer />

          {/* Welcome Popup shows on first visit each day */}
          <WelcomePopup />
        </Providers>
      </body>
    </html>
  );
}