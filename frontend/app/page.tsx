"use client";

import React, { useState, useEffect } from "react";
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

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("120.50");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isArkivModalOpen, setIsArkivModalOpen] = useState(false);
  const [arkivSearchEntityId, setArkivSearchEntityId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FairDropEvent | null>(null);

  // Auto-detect previously connected MetaMask account & listen to account switches
  useEffect(() => {
    if (typeof window === "undefined") return;

    const anyWindow = window as unknown as {
      ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
        on?: (event: string, handler: (...args: unknown[]) => void) => void;
        removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
      };
    };

    const eth = anyWindow.ethereum;
    if (eth && typeof eth.request === "function") {
      // Check if user is already authorized
      eth
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts && accounts.length > 0 && accounts[0]) {
            setWalletAddress(accounts[0].trim());
          }
        })
        .catch(() => {});

      const handleAccountsChanged = (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs && accs.length > 0 && accs[0]) {
          setWalletAddress(accs[0].trim());
        } else {
          setWalletAddress(null);
        }
      };

      eth.on?.("accountsChanged", handleAccountsChanged);

      return () => {
        eth.removeListener?.("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const handleConnectWallet = (address: string) => {
    setWalletAddress(address);
    setWalletBalance("120.50");
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
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
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onOpenArkivExplorer={handleOpenArkivExplorer}
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
