"use client";

import { IDKitRequestWidget, type IDKitResult, type RpContext, proofOfHuman } from "@worldcoin/idkit";
import { useState } from "react";
import { fetchRpContext, submitClaimProof } from "../integrations/world/world-client";
import type { ClaimRecord, EventItem } from "../integrations/world/types";

interface WorldIdClaimWidgetProps {
  event: EventItem;
  walletAddress: string;
  onClaimSuccess?: (claim: ClaimRecord) => void;
}

export function WorldIdClaimWidget({
  event,
  walletAddress,
  onClaimSuccess,
}: WorldIdClaimWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isVerifyingOnServer, setIsVerifyingOnServer] = useState(false);
  const [claimStatus, setClaimStatus] = useState<
    "idle" | "ready" | "verifying" | "success" | "duplicate" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successfulClaim, setSuccessfulClaim] = useState<ClaimRecord | null>(null);

  const appId = (process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_fairdrop") as `app_${string}`;
  const environment = (process.env.NEXT_PUBLIC_WORLD_ENVIRONMENT || "staging") as "staging" | "production" | "sandbox";

  // Pre-fetch server-signed RP context and open widget
  const handleStartClaim = async () => {
    if (!walletAddress) {
      setClaimStatus("error");
      setErrorMessage("Please connect an EVM wallet before claiming a ticket.");
      return;
    }

    try {
      setIsLoadingContext(true);
      setErrorMessage(null);
      setClaimStatus("ready");

      const context = await fetchRpContext(event.actionId);
      setRpContext(context);
      setIsOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to obtain RP signature from backend.";
      setClaimStatus("error");
      setErrorMessage(msg);
    } finally {
      setIsLoadingContext(false);
    }
  };

  // Authoritative server-side verification handler called by IDKit
  const handleVerify = async (result: IDKitResult) => {
    setIsVerifyingOnServer(true);
    setClaimStatus("verifying");

    try {
      const claimResponse = await submitClaimProof({
        eventId: event.id,
        walletAddress,
        proofPayload: result,
      });

      if (!claimResponse.success || !claimResponse.claim) {
        if (claimResponse.error === "DUPLICATE_CLAIM") {
          setClaimStatus("duplicate");
          setErrorMessage(
            claimResponse.message ?? "This World ID has already claimed a ticket for this event."
          );
        } else {
          setClaimStatus("error");
          setErrorMessage(claimResponse.detail ?? claimResponse.message ?? "Proof verification failed.");
        }
        return;
      }

      setSuccessfulClaim(claimResponse.claim);
      setClaimStatus("success");
      onClaimSuccess?.(claimResponse.claim);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during server verification.";
      setClaimStatus("error");
      setErrorMessage(msg);
    } finally {
      setIsVerifyingOnServer(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-violet-950/20 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            {event.location}
          </span>
          <h2 className="mt-1 text-2xl font-bold text-white">{event.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{event.date}</p>
        </div>
        <div className="text-right">
          <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
            {event.totalTickets - event.claimedTickets} of {event.totalTickets} available
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{event.description}</p>

      {/* Status Alerts */}
      <div className="mt-6 space-y-3">
        {claimStatus === "verifying" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-violet-200">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
            <p className="text-sm font-medium">Verifying World ID proof and registering claim on server...</p>
          </div>
        ) : null}

        {claimStatus === "success" && successfulClaim ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <h3 className="font-semibold text-white">Ticket Claim Confirmed!</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-emerald-300">
              One ticket has been allocated to wallet{" "}
              <span className="font-mono">{successfulClaim.walletAddress}</span>.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-emerald-400/90">
              <span>Claim ID: {successfulClaim.id}</span>
              <span>Nullifier: {successfulClaim.nullifierHash}</span>
            </div>
          </div>
        ) : null}

        {claimStatus === "duplicate" ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">!</span>
              <h3 className="font-semibold text-white">Duplicate Claim Rejected</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-300">
              {errorMessage}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              FairDrop enforces strictly one ticket per unique human per event. You are still eligible to claim tickets for other events.
            </p>
          </div>
        ) : null}

        {claimStatus === "error" && errorMessage ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
            <h4 className="font-semibold">Verification Error</h4>
            <p className="mt-1 text-xs text-rose-300">{errorMessage}</p>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleStartClaim}
          disabled={isLoadingContext || isVerifyingOnServer || !walletAddress}
          className="flex-1 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingContext
            ? "Preparing RP Signature..."
            : isVerifyingOnServer
            ? "Verifying Proof..."
            : "Verify with World ID & Claim"}
        </button>
      </div>

      {/* Official World ID 4.0 IDKit Widget */}
      {rpContext ? (
        <IDKitRequestWidget
          open={isOpen}
          onOpenChange={setIsOpen}
          app_id={appId}
          action={event.actionId}
          rp_context={rpContext}
          preset={proofOfHuman()}
          allow_legacy_proofs={true}
          environment={environment}
          handleVerify={handleVerify}
          onSuccess={() => setIsOpen(false)}
          onError={(code, debug) => {
            console.error("IDKit error:", code, debug);
            setClaimStatus("error");
            setErrorMessage(`IDKit encountered an error: ${code}`);
          }}
        />
      ) : null}
    </div>
  );
}

