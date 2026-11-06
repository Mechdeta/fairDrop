"use client";

import React, { useState } from "react";
import {
  Ticket,
  ArrowRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Lock,
  Coins,
  X,
  ExternalLink,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { RESALE_LISTINGS, ResaleListing } from "../data/mockData";

export function MarketplaceSection() {
  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);

  return (
    <section id="marketplace" className="relative scroll-mt-24 py-24 md:py-32 bg-[#10121C]/60 border-y border-white/[0.05]">
      {/* Background radial gradient */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[800px] rounded-full bg-purple-600/5 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <Ticket className="h-3.5 w-3.5 text-violet-400" />
            <span>Anti-Scalp Secondary Market</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Your Ticket. Your Choice. Fair Resale.
          </h2>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Can&apos;t attend anymore? Resell your verified ticket legally through smart contracts with organizer-enforced price caps, zero scalping syndicates, and verified human buyers.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span>Phase 3 Protocol Preview — Verified Smart-Contract Architecture</span>
          </div>
        </div>

        {/* 4 Resale Rules Cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#141724]/90 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-3">
              <Percent className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Organizer Price Caps</h4>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Resale prices cannot exceed organizer limits (e.g., max +10% over face value). 10x scalping is impossible on-chain.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#141724]/90 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-3">
              <UserCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Buyer Eligibility</h4>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Buyers must complete World ID verification. Secondary transfers cannot be scooped up by bulk buyer bots.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#141724]/90 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-3">
              <Coins className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">USDC Instant Settlement</h4>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Resale funds settle automatically in native USDC via Arc protocol, routing royalties to artists instantly.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#141724]/90 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mb-3">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Cryptographic Transfer</h4>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Old QR code invalidated atomically. Ticket is re-minted directly into the buyer&apos;s wallet. Zero fraud.
            </p>
          </div>
        </div>

        {/* Resale Listings Table / Grid */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#141724]/80 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4 bg-white/[0.01]">
            <div>
              <h3 className="text-base font-bold text-white">
                Live Secondary Listings
              </h3>
              <p className="text-xs text-slate-400">
                Sample listings demonstrating anti-scalp price ceilings and verified-human transfer locks
              </p>
            </div>
            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-mono text-violet-300">
              Demo Marketplace Data
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-black/20 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-6">Event & Ticket</th>
                  <th className="py-3.5 px-6">Seller Wallet</th>
                  <th className="py-3.5 px-6">Face Value</th>
                  <th className="py-3.5 px-6">Resale Price</th>
                  <th className="py-3.5 px-6">Price Cap Check</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {RESALE_LISTINGS.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white text-sm">
                        {listing.eventName}
                      </div>
                      <div className="text-[11px] text-violet-300 font-mono mt-0.5">
                        {listing.ticketNumber} • {listing.tier}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-300">
                      {listing.sellerWallet}
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-300">
                      {listing.originalPriceUsdc === 0
                        ? "Free"
                        : `${listing.originalPriceUsdc} USDC`}
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {listing.resalePriceUsdc === 0
                        ? "Free (Transfer)"
                        : `${listing.resalePriceUsdc} USDC`}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{listing.markupPercent === 0 ? "0% Markup" : `+${listing.markupPercent}% (Capped)`}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono border ${
                          listing.status === "Available"
                            ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/30"
                            : listing.status === "Pending Settlement"
                            ? "bg-amber-950/70 text-amber-300 border-amber-500/30"
                            : "bg-slate-900 text-slate-400 border-white/10"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{listing.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedListing(listing)}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-violet-600 hover:text-white hover:border-violet-500/40 transition-all"
                      >
                        View Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-white/[0.06] p-4 space-y-4">
            {RESALE_LISTINGS.map((listing) => (
              <div key={listing.id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {listing.eventName}
                    </h4>
                    <span className="text-xs text-violet-300 font-mono">
                      {listing.ticketNumber} • {listing.tier}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold border ${
                      listing.status === "Available"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800 text-slate-300 border-white/10"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Seller: {listing.sellerWallet}</span>
                  <span className="font-bold text-white text-sm">
                    {listing.resalePriceUsdc === 0 ? "Free" : `${listing.resalePriceUsdc} USDC`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ Price capped (max {listing.priceCapMaxUsdc} USDC)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedListing(listing)}
                    className="rounded-lg bg-violet-600/80 px-3 py-1 text-xs text-white"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Listing Inspection Modal */}
        {selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#141724] p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider">
                <Ticket className="h-4 w-4" />
                <span>Secondary Resale Specification</span>
              </div>

              <h3 className="text-xl font-bold text-white mt-2">
                {selectedListing.eventName}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedListing.ticketNumber} — {selectedListing.tier}
              </p>

              <div className="mt-5 space-y-3 rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Original Face Value:</span>
                  <span className="font-mono text-white">{selectedListing.originalPriceUsdc} USDC</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Authorized Resale Price:</span>
                  <span className="font-mono font-bold text-violet-300">
                    {selectedListing.resalePriceUsdc} USDC
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Smart Contract Hard Ceiling:</span>
                  <span className="font-mono text-emerald-400">
                    {selectedListing.priceCapMaxUsdc} USDC
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-white/[0.06] pt-2">
                  <span>Settlement Mechanism:</span>
                  <span className="text-white font-mono text-[11px]">
                    {selectedListing.settlementNetwork}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-violet-950/20 border border-violet-500/20 p-3 text-xs text-violet-200">
                <p>
                  <strong>Phase 3 Feature:</strong> When live, purchasing this listing executes an atomic Arc USDC escrow transaction that revokes the seller&apos;s ticket and transfers cryptographic ownership to your World ID-verified wallet.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
