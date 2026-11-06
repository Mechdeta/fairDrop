"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "../src/components/Navbar";
import { HeroSection } from "../src/components/HeroSection";
import { EventsSection } from "../src/components/EventsSection";
import { HowItWorksSection } from "../src/components/HowItWorksSection";
import { PartnersSection } from "../src/components/PartnersSection";
import { MarketplaceSection } from "../src/components/MarketplaceSection";
import { TrustSection } from "../src/components/TrustSection";
import { Footer } from "../src/components/Footer";
import { EventModal } from "../src/components/EventModal";
import { WalletModal } from "../src/components/WalletModal";
import { ArkivExplorerModal } from "../src/components/ArkivExplorerModal";
import { FairDropEvent } from "../src/data/mockData";
import {
  EIP1193Provider,
  fetchWalletBalance,
  switchOrAddArcNetwork,
  isArcChain,
  getProviderForWallet,
} from "../src/integrations/wallet";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState<string>("USDC");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isArcTestnet, setIsArcTestnet] = useState<boolean>(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [activeProvider, setActiveProvider] = useState<EIP1193Provider | null>(null);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isArkivModalOpen, setIsArkivModalOpen] = useState(false);
  const [arkivSearchEntityId, setArkivSearchEntityId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FairDropEvent | null>(null);

  /**
   * Refreshes real live on-chain balance for the connected wallet
   */
  const loadWalletBalance = useCallback(
    async (provider: EIP1193Provider, address: string, targetChainId: number | null) => {
      setIsLoadingBalance(true);
      try {
        const bal = await fetchWalletBalance(provider, address, targetChainId);
        setWalletBalance(bal.balance);
        setCurrencySymbol(bal.symbol);
      } catch {
        setWalletBalance("0.00");
      } finally {
        setIsLoadingBalance(false);
      }
    },
    []
  );

  /**
   * Reads full wallet state (address, chain ID, live balance)
   */
  const syncWalletState = useCallback(
    async (provider: EIP1193Provider, address: string) => {
      setWalletAddress(address);
      setActiveProvider(provider);

      try {
        const hexChainId = (await provider.request({
          method: "eth_chainId",
        })) as string;
        const parsedChainId = parseInt(hexChainId, 16);
        setChainId(parsedChainId);
        const onArc = isArcChain(parsedChainId);
        setIsArcTestnet(onArc);
        await loadWalletBalance(provider, address, parsedChainId);
      } catch (err) {
        console.warn("Failed to query chain state:", err);
      }
    },
    [loadWalletBalance]
  );

  // Auto-detect previously authorized accounts via EIP-1193 eth_accounts
  useEffect(() => {
    if (typeof window === "undefined") return;

    const provider = getProviderForWallet("generic");
    if (!provider || typeof provider.request !== "function") return;

    setActiveProvider(provider);

    provider
      .request({ method: "eth_accounts" })
      .then(async (accountsRaw) => {
        const accounts = accountsRaw as string[];
        if (accounts && accounts.length > 0 && accounts[0]) {
          const address = accounts[0].trim();
          await syncWalletState(provider, address);
        }
      })
      .catch(() => {});

    // Listen for account switches
    const handleAccountsChanged = async (accountsRaw: unknown) => {
      const accs = accountsRaw as string[];
      if (accs && accs.length > 0 && accs[0]) {
        const newAddress = accs[0].trim();
        await syncWalletState(provider, newAddress);
      } else {
        // User disconnected in wallet extension
        setWalletAddress(null);
        setWalletBalance(null);
        setChainId(null);
        setIsArcTestnet(false);
      }
    };

    // Listen for network switches
    const handleChainChanged = async (hexChainIdRaw: unknown) => {
      const hex = hexChainIdRaw as string;
      const newChainId = parseInt(hex, 16);
      setChainId(newChainId);
      const onArc = isArcChain(newChainId);
      setIsArcTestnet(onArc);

      // Re-fetch live balance on new network
      if (walletAddress) {
        await loadWalletBalance(provider, walletAddress, newChainId);
      }
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [syncWalletState, loadWalletBalance, walletAddress]);

  /**
   * User connected through genuine wallet modal
   */
  const handleConnectWallet = async (
    address: string,
    initialChainId?: number,
    provider?: EIP1193Provider
  ) => {
    const activeProv = provider || activeProvider || getProviderForWallet("generic");
    if (activeProv) {
      await syncWalletState(activeProv, address);
    } else {
      setWalletAddress(address);
      if (initialChainId) {
        setChainId(initialChainId);
        setIsArcTestnet(isArcChain(initialChainId));
      }
    }
  };

  /**
   * User manually disconnects wallet in UI
   */
  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setChainId(null);
    setIsArcTestnet(false);
    setActiveProvider(null);
  };

  /**
   * Prompts wallet to switch or add Arc Testnet (Chain ID 9824)
   */
  const handleSwitchToArc = async (): Promise<boolean> => {
    const prov = activeProvider || getProviderForWallet("generic");
    if (!prov) return false;

    try {
      const result = await switchOrAddArcNetwork(prov);
      if (result.success) {
        setChainId(result.chainId);
        setIsArcTestnet(true);
        if (walletAddress) {
          await loadWalletBalance(prov, walletAddress, result.chainId);
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      const anyErr = err as { message?: string };
      console.error("Arc network switch error:", anyErr.message);
      throw err;
    }
  };

  const handleOpenArkivExplorer = (entityId?: string) => {
    setArkivSearchEntityId(entityId ?? null);
    setIsArkivModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#080A12] text-[#F8FAFC]">
      {/* Top Navbar */}
      <Navbar
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        currencySymbol={currencySymbol}
        chainId={chainId}
        isArcTestnet={isArcTestnet}
        isLoadingBalance={isLoadingBalance}
        onSwitchToArc={handleSwitchToArc}
        onDisconnectWallet={handleDisconnectWallet}
      />

      <main>
        {/* Hero Section with Product Preview Card */}
        <HeroSection onOpenArkivExplorer={handleOpenArkivExplorer} />

        {/* Event Discovery Section */}
        <EventsSection
          onSelectEvent={(event) => setSelectedEvent(event)}
        />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Three Technologies / Partners Integration Section */}
        <PartnersSection />

        {/* Secondary Ticket Marketplace Preview */}
        <MarketplaceSection
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          chainId={chainId}
          isArcTestnet={isArcTestnet}
          activeProvider={activeProvider}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onOpenArkivExplorer={handleOpenArkivExplorer}
          onSwitchToArc={handleSwitchToArc}
          onRefreshBalance={async () => {
            if (activeProvider && walletAddress) {
              await loadWalletBalance(activeProvider, walletAddress, chainId);
            }
          }}
          onUpdateWalletBalance={(newBal) => setWalletBalance(newBal)}
        />

        {/* Trust & Transparency Section */}
        <TrustSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <EventModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        walletAddress={walletAddress}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenArkivExplorer={handleOpenArkivExplorer}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnectWallet={handleConnectWallet}
      />

      <ArkivExplorerModal
        isOpen={isArkivModalOpen}
        onClose={() => {
          setIsArkivModalOpen(false);
          setArkivSearchEntityId(null);
        }}
        initialEntityId={arkivSearchEntityId}
      />
    </div>
  );
}
