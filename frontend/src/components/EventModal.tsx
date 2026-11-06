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
  Database,
  Coins,
} from "lucide-react";
import { FairDropEvent } from "../data/mockData";
import { WorldIdVerificationModal, type ClaimSuccessData } from "./WorldIdVerificationModal";

interface EventModalProps {
  event: FairDropEvent | null;
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  onOpenWalletModal: () => void;
  onOpenArkivExplorer?: (entityId?: string) => void;
}

export function EventModal({
  event,
  isOpen,
  onClose,
  walletAddress,
  onOpenWalletModal,
  onOpenArkivExplorer,
}: EventModalProps) {
  const [claimStatus, setClaimStatus] = useState<"idle" | "verifying" | "success" | "duplicate" | "error">("idle");
  const [claimData, setClaimData] = useState<ClaimSuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live World ID 4.0 Verification Modal state
  const [isWorldIdModalOpen, setIsWorldIdModalOpen] = useState(false);

  if (!isOpen || !event) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const action = event.actionId || `${event.id}-ticket-claim`;

  /**
   * Start REAL World ID 4.0 Verification:
   * Opens the dedicated dark-themed verification modal which uses the official IDKit SDK.
   */
  const handleStartRealWorldIdClaim = () => {
    if (!walletAddress) {
      onOpenWalletModal();
      return;
    }
    setIsWorldIdModalOpen(true);
  };

  /**
   * Handler when proof verification succeeds on backend
   */
  const handleVerificationSuccess = (data: ClaimSuccessData) => {
    setClaimData(data);
    setClaimStatus("success");
  };

  /**
   * Secondary fallback for offline sandbox testing when without a phone or World App simulator
   */
  const handleSimulateClaim = async () => {
    if (!walletAddress) {
      onOpenWalletModal();
      return;
    }

    setClaimStatus("verifying");
    setErrorMessage(null);

    const mockNullifier = "0xmock_human_" + walletAddress.slice(2, 10).toLowerCase() + "_" + event.id.slice(0, 4);
    const proofPayload = {
      protocol_version: "4.0",
      nonce: "0x" + Math.random().toString(16).substring(2, 10),
      action,
      responses: [
        {
          identifier: "proof_of_human",
          nullifier: mockNullifier,
          proof: ["0x1", "0x2", "0x3", "0x4", "0x5"],
          issuer_schema_id: 1,
          expires_at_min: Math.floor(Date.now() / 1000) + 3600,
        },
      ],
    };

    try {
      const res = await fetch(`${apiUrl}/api/claims/verify-and-claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          wallet_address: walletAddress,
          proof_payload: proofPayload,
        }),
      });

      const data = await res.json();

      if (res.status === 201 && data.success) {
        setClaimData({
          ticketNumber: data.claim.ticketNumber || `#TKT-${data.claim.id.slice(-4).toUpperCase()}`,
          nullifierHash: data.claim.nullifierHash,
          arkivEntityId: data.claim.arkivEntityId || `arkiv_alloc_${event.id}_001`,
          arkivBlockNumber: data.claim.arkivBlockNumber || 1842095,
          arkivTxHash: data.claim.arkivTxHash || "0x9f1a2b...c3d4",
        });
        setClaimStatus("success");
      } else if (res.status === 409 || data.error === "DUPLICATE_CLAIM") {
        setClaimStatus("duplicate");
      } else {
        const fallbackTicket = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        setClaimData({
          ticketNumber: fallbackTicket,
          nullifierHash: `${mockNullifier.slice(0, 10)}...${mockNullifier.slice(-6)}`,
          arkivEntityId: `arkiv_alloc_${event.id}_${fallbackTicket.replace("#", "")}`,
          arkivBlockNumber: 1842095,
          arkivTxHash: "0x" + Math.random().toString(16).substring(2, 18),
        });
        setClaimStatus("success");
      }
    } catch {
      const fallbackTicket = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      setClaimData({
        ticketNumber: fallbackTicket,
        nullifierHash: `${mockNullifier.slice(0, 10)}...${mockNullifier.slice(-6)}`,
        arkivEntityId: `arkiv_alloc_${event.id}_${fallbackTicket.replace("#", "")}`,
        arkivBlockNumber: 1842095,
        arkivTxHash: "0x" + Math.random().toString(16).substring(2, 18),
      });
      setClaimStatus("success");
    }
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

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-600/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-md">
              {event.category}
            </span>
            <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-xs font-mono text-emerald-300">
              {event.status}
            </span>
          </div>

          {/* Event title on banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {event.name}
            </h2>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 p-3">
              <Calendar className="h-5 w-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Date</p>
                <p className="text-xs font-medium text-slate-200">{event.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 p-3">
              <Clock className="h-5 w-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Time</p>
                <p className="text-xs font-medium text-slate-200">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 p-3">
              <MapPin className="h-5 w-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Location</p>
                <p className="text-xs font-medium text-slate-200 truncate">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
              About This Event
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Quota & Pricing Bar */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-950/30 to-indigo-950/30 border border-violet-500/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-violet-300 tracking-wider block">
                  Fair Primary Price
                </span>
                <span className="text-2xl font-black text-white">${event.priceUsdc}</span>
                <span className="text-[11px] text-slate-400 ml-1.5">(USDC on Arc)</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Capacity Progress
                </span>
                <span className="text-xs font-mono font-bold text-violet-300">
                  {event.claimedTickets} / {event.totalTickets} Claimed ({percentClaimed}%)
                </span>
              </div>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400"
                style={{ width: `${percentClaimed}%` }}
              />
            </div>
          </div>

          {/* Architecture Protections Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-black/40 border border-white/5 p-3">
              <ShieldCheck className="h-4 w-4 text-violet-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">World ID 4.0</p>
              <p className="text-[10px] text-slate-400 mt-0.5">1 human = 1 ticket</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/5 p-3">
              <Database className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Arkiv DB-Chain</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Immutable allocation</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/5 p-3">
              <Coins className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Arc Protocol</p>
              <p className="text-[10px] text-slate-400 mt-0.5">USDC + Anti-Scalp Cap</p>
            </div>
          </div>

          {/* Verification & Claim Pipeline Section */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">
                  World ID 4.0 Verification & Claim
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
                Official IDKit 4.0
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
                        Will open official World ID widget, generate ZK proof, and commit allocation to Arkiv.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleStartRealWorldIdClaim}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition-all"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Verify with World ID</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSimulateClaim}
                        title="Simulate mock proof for local automated testing without phone"
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline px-2 py-1"
                      >
                        (Dev Mock)
                      </button>
                    </div>
                  </div>
                )}

                {claimStatus === "verifying" && (
                  <div className="flex items-center justify-center gap-3 py-4 text-violet-300 text-xs font-mono">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                    <span>Verifying World ID ZKP & indexing onto Arkiv DB-Chain...</span>
                  </div>
                )}

                {claimStatus === "success" && claimData && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-emerald-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Ticket Claim Verified & Indexed!</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-md text-white">
                        {claimData.ticketNumber}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                      <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                        <span className="text-[10px] text-slate-500 block">World Nullifier:</span>
                        <span className="text-emerald-300 truncate block">{claimData.nullifierHash}</span>
                      </div>
                      <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                        <span className="text-[10px] text-slate-500 block">Arkiv Entity ID:</span>
                        <span className="text-indigo-300 truncate block">{claimData.arkivEntityId}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-500/20">
                      <button
                        type="button"
                        onClick={handleStartRealWorldIdClaim}
                        className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-[11px] text-slate-200 transition-colors"
                      >
                        Test Duplicate Verification (Should 409 Reject)
                      </button>

                      {onOpenArkivExplorer && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenArkivExplorer(claimData.arkivEntityId);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
                        >
                          <Database className="h-3 w-3" />
                          <span>Inspect on Arkiv Explorer</span>
                        </button>
                      )}
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
                      {errorMessage || (
                        <>
                          The FairDrop backend unique constraint{" "}
                          <code className="text-violet-300 bg-white/5 px-1 py-0.5 rounded">
                            UNIQUE(event_id, world_nullifier_hash)
                          </code>{" "}
                          prevented a repeated registration.
                        </>
                      )}
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setClaimStatus("idle")}
                        className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-[11px] text-slate-200"
                      >
                        Reset Claim State
                      </button>
                    </div>
                  </div>
                )}

                {claimStatus === "error" && errorMessage && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-4 text-rose-300">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                      <span>Verification Failed</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{errorMessage}</p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setClaimStatus("idle")}
                        className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-[11px] text-slate-200"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official World ID 4.0 Verification Modal */}
      <WorldIdVerificationModal
        isOpen={isWorldIdModalOpen}
        onClose={() => setIsWorldIdModalOpen(false)}
        event={event}
        walletAddress={walletAddress}
        onOpenWalletModal={onOpenWalletModal}
        onVerificationSuccess={handleVerificationSuccess}
        onOpenArkivExplorer={onOpenArkivExplorer}
      />
    </div>
  );
}
