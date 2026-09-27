import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SocialBar from "@/components/SocialBar";
import ToastContainer from "@/components/Toast";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
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
        <Navbar />
        <main className="min-h-screen">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* 👇 New Footer with Admin Access button */}
        <Footer />

        <WhatsAppFloat />
        <SocialBar />
        <ToastContainer />
      </body>
    </html>
  );
}