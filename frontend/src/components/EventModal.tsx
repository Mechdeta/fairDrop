"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { FairDropEvent } from "../data/mockData";

interface EventModalProps {
  event: FairDropEvent | null;
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  onOpenWalletModal: () => void;
}

export function EventModal({
  event,
  isOpen,
  onClose,
  walletAddress,
  onOpenWalletModal,
}: EventModalProps) {
  const [claimStatus, setClaimStatus] = useState<"idle" | "verifying" | "success" | "duplicate">("idle");
  const [claimedEvents, setClaimedEvents] = useState<Record<string, string>>({});

  if (!isOpen || !event) return null;

  const isAlreadyClaimed = Boolean(claimedEvents[event.id]);

  const handleSimulateClaim = () => {
    if (!walletAddress) {
      onOpenWalletModal();
      return;
    }

    if (isAlreadyClaimed) {
      setClaimStatus("duplicate");
      return;
    }

    setClaimStatus("verifying");
    setTimeout(() => {
      const generatedNullifier = "0x" + Math.random().toString(16).substring(2, 10) + "..." + Math.random().toString(16).substring(2, 6);
      setClaimedEvents((prev) => ({
        ...prev,
        [event.id]: generatedNullifier,
      }));
      setClaimStatus("success");
    }, 1400);
  };

  const percentClaimed = Math.round((event.claimedTickets / event.totalTickets) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#10121C] shadow-2xl shadow-violet-950/40 my-8">
        {/* Banner image with overlay */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10121C] via-[#10121C]/60 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-colors border border-white/10"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="rounded-full border border-violet-400/30 bg-violet-950/80 px-3 py-1 text-xs font-semibold text-violet-200 backdrop-blur-md">
              {event.categoryLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono text-slate-300 backdrop-blur-md">
              Demo Preview Data
            </span>
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {event.name}
            </h2>
            <p className="text-sm text-violet-300 mt-1 font-medium">{event.tagline}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Meta Information Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-violet-400" />
                <span>Date</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white">{event.date}</p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                <span>Time</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white truncate">{event.time}</p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>Location</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white truncate">{event.location}</p>
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-violet-300">
                <Ticket className="h-3.5 w-3.5 text-violet-400" />
                <span>Ticket Price</span>
              </div>
              <p className="mt-1 text-sm font-bold text-white">
                {event.priceUsdc === 0 ? "Free Access" : `${event.priceUsdc} USDC`}
              </p>
            </div>
          </div>

          {/* Venue & Capacity */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Venue:</span>
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Capacity:</span>
              <span className="font-mono text-violet-300">
                {event.claimedTickets.toLocaleString()} / {event.totalTickets.toLocaleString()} Claims ({percentClaimed}%)
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
              About This Event
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>
          </div>

          {/* Highlights / Lineup */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Event Highlights & Lineup
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.lineup.map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* FairDrop Protection Rules for this event */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4">
            <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>FairDrop Event Protection Rules</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {event.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Claim / Verification Box */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">
                  World ID Claim Verification
                </span>
              </div>
              <span className="rounded-full bg-violet-500/10 border border-violet-400/20 px-2.5 py-0.5 text-[10px] font-mono text-violet-300">
                Phase 1 Flow
              </span>
            </div>

            {!walletAddress ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                <p className="text-xs text-amber-200 mb-3">
                  Please connect an EVM Web3 wallet first to bind your event-scoped ticket claim.
                </p>
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md"
                >
                  Connect Web3 Wallet
                </button>
              </div>
            ) : (
              <div>
                {claimStatus === "idle" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                      <p>
                        Wallet:{" "}
                        <span className="font-mono text-white">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Will generate an event-scoped ZK proof for {event.id}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateClaim}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verify & Claim with World ID</span>
                    </button>
                  </div>
                )}

                {claimStatus === "verifying" && (
                  <div className="flex items-center justify-center gap-3 py-4 text-violet-300 text-xs font-mono">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                    <span>Submitting Zero-Knowledge Proof to FairDrop Backend...</span>
                  </div>
                )}

                {claimStatus === "success" && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-emerald-300">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Ticket Claim Entry Successfully Verified!</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Event nullifier hash:{" "}
                      <span className="font-mono text-emerald-300">
                        {claimedEvents[event.id] || "0x98b4...119c"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Your entry is secured for {event.name}. A duplicate claim from your World ID for this event will be rejected by backend constraints.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSimulateClaim}
                        className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-[11px] text-slate-200 transition-colors"
                      >
                        Test Duplicate Claim (Should Reject)
                      </button>
                    </div>
                  </div>
                )}

                {claimStatus === "duplicate" && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-4 text-rose-300">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                      <span>Duplicate Claim Prevented (409 Conflict)</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      The FairDrop backend unique constraint{" "}
                      <code className="text-violet-300 bg-white/5 px-1 py-0.5 rounded">
                        UNIQUE(event_id, world_nullifier_hash)
                      </code>{" "}
                      successfully prevented a repeated registration.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setClaimStatus("success")}
                        className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-[11px] text-slate-200"
                      >
                        Back to Verified State
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
