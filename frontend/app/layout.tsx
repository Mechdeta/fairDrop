import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairDrop — The Bot-Proof Ticket Marketplace",
  description:
    "A fairer way to distribute limited event tickets using privacy-preserving human verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
