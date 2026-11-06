"use client";

import { useEffect, useState } from "react";

interface WalletConnectProps {
  walletAddress: string;
  onWalletChange: (address: string) => void;
}

export function WalletConnect({ walletAddress, onWalletChange }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: unknown }).ethereum) {
      setHasProvider(true);
    }
  }, []);

  const connectInjected = async () => {
    const eth = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) return;

    try {
      setIsConnecting(true);
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        onWalletChange(accounts[0].toLowerCase());
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const generateDemoWallet = () => {
    // Deterministic or random mock EVM address for testing
    const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    onWalletChange(`0x${hex}`);
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
              <span className="text-slate-400">No wallet connected</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasProvider ? (
            <button
              onClick={connectInjected}
              disabled={isConnecting}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : walletAddress ? "Switch Wallet" : "Connect MetaMask"}
            </button>
          ) : null}

          <button
            onClick={generateDemoWallet}
            type="button"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {walletAddress ? "Generate New Address" : "Use Demo Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}

