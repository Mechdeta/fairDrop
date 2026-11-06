"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  ExternalLink,
  Smartphone,
  QrCode,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";
import {
  useIDKitRequest,
  proofOfHuman,
  type IDKitResult,
  type RpContext,
  IDKitErrorCodes,
} from "@worldcoin/idkit";
import QRCode from "qrcode";
import type { FairDropEvent } from "../data/mockData";

export interface ClaimSuccessData {
  ticketNumber: string;
  nullifierHash: string;
  arkivEntityId: string;
  arkivBlockNumber: number;
  arkivTxHash: string;
}

interface WorldIdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: FairDropEvent | null;
  walletAddress: string | null;
  onOpenWalletModal: () => void;
  onVerificationSuccess: (data: ClaimSuccessData) => void;
  onOpenArkivExplorer?: (entityId?: string) => void;
}

type VerificationStatus =
  | "initializing"
  | "waiting_for_scan"
  | "awaiting_approval"
  | "verifying_proof"
  | "success"
  | "duplicate"
  | "failed"
  | "expired"
  | "cancelled";

/**
 * Headless session runner that mounts useIDKitRequest with a validated rp_context
 */
function HeadlessIDKitRunner({
  appId,
  action,
  rpContext,
  environment,
  onConnectorUriChange,
  onStatusChange,
  onProofReceived,
  onErrorOccurred,
}: {
  appId: `app_${string}`;
  action: string;
  rpContext: RpContext;
  environment: "production" | "staging" | "sandbox";
  onConnectorUriChange: (uri: string | null) => void;
  onStatusChange: (status: "waiting_for_scan" | "awaiting_approval" | "verifying_proof") => void;
  onProofReceived: (result: IDKitResult) => void;
  onErrorOccurred: (err: string) => void;
}) {
  const flow = useIDKitRequest({
    app_id: appId,
    action,
    rp_context: rpContext,
    preset: proofOfHuman(),
    allow_legacy_proofs: true,
    environment,
    polling: {
      interval: 1500,
      timeout: 300000,
    },
  });

  const openedRef = useRef(false);
  const handledResultRef = useRef<IDKitResult | null>(null);

  // Trigger flow.open() once when runner mounts
  useEffect(() => {
    if (!openedRef.current) {
      openedRef.current = true;
      flow.open();
    }
    return () => {
      flow.reset();
    };
  }, []);

  // Update connector URI whenever SDK generates it
  useEffect(() => {
    if (flow.connectorURI) {
      onConnectorUriChange(flow.connectorURI);
    }
  }, [flow.connectorURI, onConnectorUriChange]);

  // Monitor flow lifecycle states
  useEffect(() => {
    if (flow.isSuccess && flow.result && flow.result !== handledResultRef.current) {
      handledResultRef.current = flow.result;
      onStatusChange("verifying_proof");
      onProofReceived(flow.result);
    } else if (flow.isAwaitingUserConfirmation) {
      onStatusChange("awaiting_approval");
    } else if (flow.isAwaitingUserConnection) {
      onStatusChange("waiting_for_scan");
    } else if (flow.isError) {
      const code = flow.errorCode ?? "UNKNOWN_IDKIT_ERROR";
      onErrorOccurred(`IDKit error: ${code}`);
    }
  }, [
    flow.isSuccess,
    flow.result,
    flow.isAwaitingUserConfirmation,
    flow.isAwaitingUserConnection,
    flow.isError,
    flow.errorCode,
    onStatusChange,
    onProofReceived,
    onErrorOccurred,
  ]);

  return null;
}

export function WorldIdVerificationModal({
  isOpen,
  onClose,
  event,
  walletAddress,
  onOpenWalletModal,
  onVerificationSuccess,
  onOpenArkivExplorer,
}: WorldIdVerificationModalProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const defaultAppId = (process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_2ef2e19628d1c70a482521c44d9e76fc") as `app_${string}`;
  const defaultEnv = (process.env.NEXT_PUBLIC_WORLD_ENVIRONMENT || "production") as "production" | "staging";

  const [environment, setEnvironment] = useState<"production" | "staging">(defaultEnv);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [connectorURI, setConnectorURI] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>("initializing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<ClaimSuccessData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 min TTL
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileTab, setMobileTab] = useState<"app" | "qr">("app");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Compute exact action to guarantee 1-to-1 parity with backend
  const action = useMemo(() => {
    if (!event) return "default-ticket-claim";
    return event.actionId || `${event.id}-ticket-claim`;
  }, [event]);

  // Detect mobile device
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || status === "success" || status === "duplicate" || status === "failed" || status === "cancelled") {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("expired");
          setErrorMessage("Verification session timed out. Please refresh to generate a new QR code.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  // Fetch backend RP Context whenever modal opens or retry triggered
  const initRpContext = useCallback(async () => {
    if (!event) return;
    setStatus("initializing");
    setErrorMessage(null);
    setConnectorURI(null);
    setQrCodeDataUrl(null);
    setRpContext(null);
    setTimeLeft(300);

    try {
      const res = await fetch(`${apiUrl}/api/world/rp-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to sign RP context from server (HTTP ${res.status})`);
      }

      const data = await res.json();
      setRpContext({
        rp_id: data.rp_id,
        nonce: data.nonce,
        created_at: data.created_at,
        expires_at: data.expires_at,
        signature: data.signature,
      });
      setStatus("waiting_for_scan");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to obtain RP signature from backend.";
      setErrorMessage(msg);
      setStatus("failed");
    }
  }, [apiUrl, action, event]);

  // Re-fetch on open
  useEffect(() => {
    if (isOpen && event && walletAddress) {
      initRpContext();
    }
  }, [isOpen, event, walletAddress, initRpContext]);

  // Render crisp QR Code whenever connectorURI is available
  useEffect(() => {
    if (!connectorURI) {
      setQrCodeDataUrl(null);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(connectorURI, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [connectorURI]);

  // Handle authoritative server-side proof verification
  const handleServerProofVerification = useCallback(
    async (proofResult: IDKitResult) => {
      if (!event || !walletAddress) return;
      setStatus("verifying_proof");
      setErrorMessage(null);

      try {
        const res = await fetch(`${apiUrl}/api/claims/verify-and-claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: event.id,
            wallet_address: walletAddress,
            proof_payload: proofResult,
          }),
        });

        const data = await res.json();

        if (res.status === 201 && data.success) {
          const successData: ClaimSuccessData = {
            ticketNumber: data.claim.ticketNumber || `#TKT-${data.claim.id.slice(-4).toUpperCase()}`,
            nullifierHash: data.claim.nullifierHash,
            arkivEntityId: data.claim.arkivEntityId || `arkiv_alloc_${event.id}_001`,
            arkivBlockNumber: data.claim.arkivBlockNumber || 1842095,
            arkivTxHash: data.claim.arkivTxHash || "0x9f1a2b...c3d4",
          };
          setClaimSuccess(successData);
          setStatus("success");
          onVerificationSuccess(successData);
        } else if (res.status === 409 || data.error === "DUPLICATE_CLAIM") {
          setStatus("duplicate");
          setErrorMessage(
            data.message || "This World ID has already claimed a ticket for this event. One human = one ticket."
          );
        } else {
          setStatus("failed");
          setErrorMessage(data.detail || data.message || "Server verification of World ID proof failed.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error during backend verification.";
        setStatus("failed");
        setErrorMessage(msg);
      }
    },
    [apiUrl, event, walletAddress, onVerificationSuccess]
  );

  // Copy connector URI link
  const handleCopyLink = () => {
    if (!connectorURI) return;
    navigator.clipboard.writeText(connectorURI);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Format time remaining MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-violet-500/30 bg-[#0B0D17] shadow-2xl shadow-violet-950/60 my-6">
        {/* Subtle purple gradient header glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-violet-600/15 via-purple-600/5 to-transparent pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  World ID 4.0 Verification
                </h3>
                <span className="rounded-full bg-violet-500/10 border border-violet-400/30 px-2 py-0.5 text-[10px] font-mono text-violet-300">
                  Official SDK
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1 Human = 1 Ticket for{" "}
                <span className="text-slate-200 font-semibold">{event.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Environment Toggle Pill */}
            <div className="hidden sm:flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEnvironment("production");
                  initRpContext();
                }}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  environment === "production"
                    ? "bg-violet-600 font-bold text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Use Production for Real World App on physical phone"
              >
                Production (Real App)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnvironment("staging");
                  initRpContext();
                }}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  environment === "staging"
                    ? "bg-indigo-600 font-bold text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Use Staging for World ID Simulator in browser"
              >
                Staging (Simulator)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Headless IDKit Session Runner (Active when rpContext is loaded) */}
        {rpContext && isOpen && (status === "waiting_for_scan" || status === "awaiting_approval" || status === "verifying_proof") && (
          <HeadlessIDKitRunner
            key={`${rpContext.nonce}-${environment}`}
            appId={defaultAppId}
            action={action}
            rpContext={rpContext}
            environment={environment}
            onConnectorUriChange={(uri) => setConnectorURI(uri)}
            onStatusChange={(newStatus) => setStatus(newStatus)}
            onProofReceived={(result) => handleServerProofVerification(result)}
            onErrorOccurred={(err) => {
              setErrorMessage(err);
              setStatus("failed");
            }}
          />
        )}

        {/* Modal Main Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Connected Wallet Badge */}
          {walletAddress && (
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3.5 py-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected Wallet:
              </span>
              <span className="font-mono text-violet-300 font-semibold">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}

          {/* INITIALIZING STATE */}
          {status === "initializing" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/40">
                <div className="absolute inset-0 rounded-2xl border-2 border-violet-400 border-t-transparent animate-spin" />
                <ShieldCheck className="h-8 w-8 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Initializing Verification Request...
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Generating cryptographically signed Relying Party context on FairDrop backend.
                </p>
              </div>
            </div>
          )}

          {/* ACTIVE VERIFICATION STATES (waiting_for_scan OR awaiting_approval) */}
          {(status === "waiting_for_scan" || status === "awaiting_approval") && (
            <div className="space-y-5">
              {/* Mobile View Toggle (if mobile device detected) */}
              {isMobileDevice && (
                <div className="flex items-center justify-center rounded-xl bg-black/50 border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setMobileTab("app")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                      mobileTab === "app"
                        ? "bg-violet-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Open in World App</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab("qr")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                      mobileTab === "qr"
                        ? "bg-violet-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Display QR Code</span>
                  </button>
                </div>
              )}

              {/* Status Header Indicator */}
              <div className="flex items-center justify-between rounded-xl bg-violet-950/30 border border-violet-500/20 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-2">
                  {status === "waiting_for_scan" ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
                      </span>
                      <span className="font-semibold text-violet-200">
                        Waiting for World App scan
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                      </span>
                      <span className="font-semibold text-amber-200">
                        Scan recognized! Awaiting your approval in World App...
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>Expires: {formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Mobile Direct Handoff (Scenario B) */}
              {isMobileDevice && mobileTab === "app" ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30">
                    <Smartphone className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">
                      Verify directly on this device
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Tap below to launch World App and approve your Proof of Human verification.
                    </p>
                  </div>

                  {connectorURI ? (
                    <a
                      href={connectorURI}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span>Open in World App</span>
                      <ExternalLink className="h-4 w-4 opacity-70" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                      <RefreshCw className="h-4 w-4 animate-spin text-violet-400" />
                      <span>Generating verification link...</span>
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-slate-500">
                      Already have World App installed? It will open directly.
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Don&apos;t have World App yet?{" "}
                      <a
                        href="https://world.org/download"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 underline hover:text-violet-300"
                      >
                        Install World App
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                /* Desktop QR Flow (Scenario A) or Mobile QR Mode */
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* High Contrast QR Code Card with Glowing Violet Ring */}
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-30 blur-md group-hover:opacity-50 transition-opacity" />
                    <div className="relative rounded-2xl bg-white p-3.5 shadow-2xl">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="World ID Verification QR Code"
                          className="h-56 w-56 sm:h-64 sm:w-64 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex h-56 w-56 sm:h-64 sm:w-64 items-center justify-center bg-slate-100 rounded-lg">
                          <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Explicit Anti-Redirect Instructions */}
                  <div className="text-center space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-bold text-white">
                      Scan with World App
                    </h4>
                    <p className="text-xs text-slate-300">
                      Open World App on your phone and scan this QR code to verify your humanity.
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[11px] text-amber-200 text-left mt-2">
                      <span className="font-bold shrink-0">⚠️ Important:</span>
                      <span>
                        Use the scanner <strong>inside the World App</strong> (top-right QR icon). Do not scan with your standard phone camera.
                      </span>
                    </div>
                  </div>

                  {/* Simulator Quick-Link for Staging */}
                  {environment === "staging" && connectorURI && (
                    <div className="w-full text-center pt-1">
                      <a
                        href={`https://simulator.worldcoin.org?connect_url=${encodeURIComponent(connectorURI)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 underline"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Testing in staging? Open in World ID Simulator</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Copy Link Utility */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-white/5 border border-white/5 rounded-lg px-2.5 py-1"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedLink ? "Link Copied!" : "Copy Verification URI"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={initRpContext}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-white/5 border border-white/5 rounded-lg px-2.5 py-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Refresh QR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VERIFYING PROOF ON BACKEND */}
          {status === "verifying_proof" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Verifying Proof on FairDrop Server...
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Submitting Zero-Knowledge Proof to World Developer API and committing your allocation to the Arkiv DB-Chain.
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {status === "success" && claimSuccess && (
            <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-5 space-y-4 text-emerald-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span>World ID Verified Successfully!</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-lg text-white">
                  {claimSuccess.ticketNumber}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Your humanity has been cryptographically proven. Your ticket allocation is secured on-chain.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono text-slate-300">
                <div className="rounded-xl bg-black/40 p-2.5 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    World Nullifier Hash
                  </span>
                  <span className="text-emerald-300 font-bold truncate block">
                    {claimSuccess.nullifierHash}
                  </span>
                </div>
                <div className="rounded-xl bg-black/40 p-2.5 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Arkiv Record Entity
                  </span>
                  <span className="text-indigo-300 font-bold truncate block">
                    {claimSuccess.arkivEntityId}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-500/20">
                {onOpenArkivExplorer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenArkivExplorer(claimSuccess.arkivEntityId);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>Inspect on Arkiv Explorer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* DUPLICATE REJECTION SCREEN */}
          {status === "duplicate" && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-5 space-y-3 text-rose-300">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <span>Duplicate Claim Prevented (409 Conflict)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {errorMessage ||
                  "This World ID has already claimed a ticket for this event. FairDrop enforces strict 1 human = 1 ticket per event."}
              </p>
              <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-[11px] font-mono text-slate-400">
                Rule: <code className="text-violet-300 font-bold">UNIQUE(event_id, world_nullifier_hash)</code>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* FAILED / ERROR SCREEN */}
          {status === "failed" && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-5 space-y-3 text-rose-300">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <span>Verification Failed</span>
              </div>
              <p className="text-xs text-slate-300">
                {errorMessage || "An error occurred during World ID verification."}
              </p>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={initRpContext}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry Verification</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EXPIRED SCREEN */}
          {status === "expired" && (
            <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-5 space-y-3 text-amber-300 text-center">
              <Clock className="h-8 w-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Verification Session Expired</h4>
              <p className="text-xs text-slate-300">
                Security TTL expired. Please generate a fresh QR code to continue.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={initRpContext}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Generate New QR Code</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="border-t border-white/5 bg-black/40 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            <span>Zero-Knowledge Proof • No personal data stored</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

