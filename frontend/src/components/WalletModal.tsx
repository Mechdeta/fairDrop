"use client";

import React, { useState, useEffect } from "react";
import { X, Wallet, ArrowRight, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import {
  SupportedWalletId,
  EIP1193Provider,
  getSupportedWalletOptions,
  connectWallet,
} from "../integrations/wallet";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWallet: (address: string, chainId?: number, provider?: EIP1193Provider) => void;
}

export function WalletModal({
  isOpen,
  onClose,
  onConnectWallet,
}: WalletModalProps) {
  const [connectingProvider, setConnectingProvider] = useState<SupportedWalletId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDownloadUrl, setErrorDownloadUrl] = useState<string | null>(null);
  const [walletOptions, setWalletOptions] = useState(() => getSupportedWalletOptions());

  // Refresh wallet provider detection whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setErrorDownloadUrl(null);
      setWalletOptions(getSupportedWalletOptions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * User-initiated connection to a genuine Web3 wallet provider
   */
  const handleSelectWallet = async (walletId: SupportedWalletId, downloadUrl: string) => {
    setErrorMessage(null);
    setErrorDownloadUrl(null);
    setConnectingProvider(walletId);

    try {
      const { address, chainId, provider } = await connectWallet(walletId);
      onConnectWallet(address, chainId, provider);
      setConnectingProvider(null);
      onClose();
    } catch (err: unknown) {
      const anyErr = err as { message?: string };
      const message = anyErr.message || "Failed to connect to wallet.";
      setErrorMessage(message);

      if (message.includes("not installed")) {
        setErrorDownloadUrl(downloadUrl);
      }
      setConnectingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#141724] p-6 shadow-2xl shadow-violet-950/40">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
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
              Connect your genuine Web3 wallet to sign and verify ticket claims
            </p>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mt-4 rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p>{errorMessage}</p>
              {errorDownloadUrl && (
                <a
                  href={errorDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-violet-300 underline hover:text-white"
                >
                  <span>Install Official Extension</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Wallet Options List */}
        <div className="mt-4 space-y-2">
          {walletOptions.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelectWallet(w.id, w.downloadUrl)}
              disabled={Boolean(connectingProvider)}
              className="w-full flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-left hover:border-violet-500/40 hover:bg-white/[0.05] transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">
                      {w.name}
                    </h4>
                    {w.isDetected && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-mono text-emerald-300">
                        Detected
                      </span>
                    )}
                  </div>
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

        {/* Real Installation Guidance (No Demo Wallets) */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-xs font-medium text-slate-300">
            Don&apos;t have a wallet yet? Install a supported wallet to continue.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span>MetaMask</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href="https://www.coinbase.com/wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span>Coinbase Wallet</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href="https://rainbow.me/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span>Rainbow</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-4 border-t border-white/[0.06] pt-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="h-3 w-3 text-violet-400" />
            <span>FairDrop interacts exclusively with genuine user-approved Web3 wallets.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
