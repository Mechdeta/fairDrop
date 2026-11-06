"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Wallet, Menu, X, ArrowUpRight, Activity } from "lucide-react";

interface NavbarProps {
  onOpenWalletModal: () => void;
  walletAddress: string | null;
  walletBalance: string;
  onDisconnectWallet: () => void;
}

export function Navbar({
  onOpenWalletModal,
  walletAddress,
  walletBalance,
  onDisconnectWallet,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ping backend health check on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch {
        // If backend isn't up at that instant, display standby indicator
        setApiOnline(false);
      }
    };
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: "Discover Events", href: "#events" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Technology", href: "#partners" },
    { label: "Marketplace", href: "#marketplace" },
    { label: "Trust & Security", href: "#trust" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#080A12]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/40"
          : "bg-transparent border-b border-white/[0.05]"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="group flex items-center gap-3.5 focus:outline-none"
            aria-label="FairDrop Home"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 p-[1px] shadow-lg shadow-violet-500/25 transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#080A12]/80 backdrop-blur-sm">
                <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-200 to-purple-400">
                  F
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#080A12] bg-emerald-400" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-violet-300">
                  FairDrop
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                  ETHGlobal
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                Bot-Proof Ticketing
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white hover:bg-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA / Wallet & Health Status */}
        <div className="hidden sm:flex items-center gap-3">
          {/* API Status Indicator */}
          <div
            className="hidden xl:flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-xs text-slate-400"
            title={apiOnline ? "Backend API is online (port 4000)" : "Backend API connecting..."}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiOnline === true
                  ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"
                  : apiOnline === false
                  ? "bg-amber-400"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-[11px] font-mono">
              {apiOnline === true ? "API: Active" : "API: Standby"}
            </span>
          </div>

          {/* Connect Wallet / Connected State */}
          {walletAddress ? (
            <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-950/30 p-1.5 pl-3">
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs font-semibold text-white">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                <span className="text-[10px] text-violet-300 font-mono">
                  {walletBalance} USDC
                </span>
              </div>
              <button
                type="button"
                onClick={onDisconnectWallet}
                className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] border border-violet-400/30"
            >
              <Wallet className="h-4 w-4 text-violet-200" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          {walletAddress ? (
            <button
              type="button"
              onClick={onDisconnectWallet}
              className="rounded-lg border border-violet-500/30 bg-violet-900/30 px-2.5 py-1.5 text-xs font-mono text-violet-200"
            >
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-2)}
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Connect
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#080A12]/95 backdrop-blur-2xl px-6 py-6 transition-all duration-300">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-200 hover:bg-white/5 hover:text-violet-300"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-500" />
              </a>
            ))}

            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span>Backend Health Status</span>
                <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {apiOnline ? "Active" : "Standby"}
                </span>
              </div>

              {!walletAddress && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWalletModal();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/30"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Web3 Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
