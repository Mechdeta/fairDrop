"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Wallet } from "lucide-react";
import { connectWallet, detectWalletProviders } from "../integrations/wallet";

interface WalletConnectProps {
  walletAddress: string;
  onWalletChange: (address: string) => void;
}

export function WalletConnect({ walletAddress, onWalletChange }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    const detected = detectWalletProviders();
    setHasProvider(detected.generic);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const { address } = await connectWallet("metamask");
      onWalletChange(address.toLowerCase());
    } catch (err: unknown) {
      const anyErr = err as { message?: string };
      setErrorMessage(anyErr.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Attendee Wallet</p>
          <p className="mt-1 text-sm text-slate-300">
            {walletAddress ? (
              <span className="font-mono text-emerald-400">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </span>
            ) : (
              <span className="text-slate-400">No genuine wallet connected</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasProvider ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{isConnecting ? "Connecting..." : walletAddress ? "Switch Account" : "Connect Real Wallet"}</span>
            </button>
          ) : (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span>Install MetaMask</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="mt-2 text-xs text-rose-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
