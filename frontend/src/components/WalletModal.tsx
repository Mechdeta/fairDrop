"use client";

import React, { useState } from "react";
import { X, Wallet, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWallet: (address: string) => void;
}

export function WalletModal({
  isOpen,
  onClose,
  onConnectWallet,
}: WalletModalProps) {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      desc: "Connect using browser extension or mobile app",
      icon: "🦊",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      desc: "Connect via Coinbase Smart Wallet or SDK",
      icon: "🔵",
    },
    {
      id: "rainbow",
      name: "Rainbow",
      desc: "Ethereum & EVM mobile wallet",
      icon: "🌈",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      desc: "Scan QR with any compatible Web3 wallet",
      icon: "⚡",
    },
  ];

  const handleSelectWallet = (providerId: string) => {
    setConnectingProvider(providerId);
    setTimeout(() => {
      // Deterministic demo wallet address for hackathon preview
      const demoAddress = "0x71C8a21BfE49A2d13b4822Ec8e59074092bF";
      onConnectWallet(demoAddress);
      setConnectingProvider(null);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#141724] p-6 shadow-2xl shadow-violet-950/40">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Connect Web3 Wallet</h3>
            <p className="text-xs text-slate-400">
              Select your EVM wallet to bind your ticket claims
            </p>
          </div>
        </div>

        {/* Demo Fast Connect Banner */}
        <div className="mt-5 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-violet-200">
                ETHGlobal Quick Demo Connect
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Connects instantly with a pre-seeded test wallet loaded with 120.50 USDC on Arc Testnet.
              </p>
              <button
                type="button"
                onClick={() => handleSelectWallet("demo-instant")}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/30 hover:brightness-110 transition-all"
              >
                Instant Connect Demo Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Options List */}
        <div className="mt-4 space-y-2">
          {walletOptions.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelectWallet(w.id)}
              disabled={Boolean(connectingProvider)}
              className="w-full flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-left hover:border-violet-500/30 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">
                    {w.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">{w.desc}</p>
                </div>
              </div>

              {connectingProvider === w.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              )}
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-5 border-t border-white/[0.06] pt-3 text-center">
          <p className="text-[10px] text-slate-500">
            By connecting, you agree to FairDrop&apos;s anti-scalping protocol rules and zero-knowledge personhood verification.
          </p>
        </div>
      </div>
    </div>
  );
}
