import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FairDrop — The Bot-Proof Ticket Marketplace | ETHGlobal Mumbai",
  description:
    "A fairer way to distribute limited event tickets using privacy-preserving human verification, transparent allocation, and blockchain-powered ownership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#080A12] text-[#F8FAFC] antialiased selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
