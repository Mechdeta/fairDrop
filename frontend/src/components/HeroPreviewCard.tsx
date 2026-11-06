"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Database,
  Coins,
} from "lucide-react";

interface HeroPreviewCardProps {
  onOpenArkivExplorer?: () => void;
}

export function HeroPreviewCard({ onOpenArkivExplorer }: HeroPreviewCardProps) {
  const [simulationState, setSimulationState] = useState<"idle" | "verifying" | "success" | "duplicate">("idle");
  const [claimAttempts, setClaimAttempts] = useState(0);

  const runSimulation = () => {
    if (simulationState === "verifying") return;

    setSimulationState("verifying");
    setTimeout(() => {
      if (claimAttempts === 0) {
        setSimulationState("success");
        setClaimAttempts(1);
      } else {
        setSimulationState("duplicate");
      }
    }, 1200);
  };

  const resetSimulation = () => {
    setSimulationState("idle");
    setClaimAttempts(0);
  };

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Background ambient glow behind preview card */}
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-indigo-600/30 blur-2xl opacity-75" />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141724]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/60">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-400/20 text-violet-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-400">
                FAIRDROP PROTECTION SYSTEM
              </p>
              <h3 className="text-base font-semibold text-white">
                World ID + Arkiv + Arc Unified Architecture
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              Pipeline Online
            </span>
          </div>
        </div>

        {/* 3 Protection Steps */}
        <div className="mt-6 space-y-4">
          {/* Step 1 */}
          <div className="group flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-950/15">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-sm font-bold">
              01
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white group-hover:text-violet-200">
                  Verify the Person
                </h4>
                <span className="text-[10px] uppercase font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                  World ID ZKP
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                World ID verifies unique-human eligibility without collecting names, phone numbers or biometric leaks.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-950/15">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-sm font-bold">
              02
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white group-hover:text-purple-200">
                  Protect Each Event
                </h4>
                <span className="text-[10px] uppercase font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  Arkiv DB-Chain
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                One eligible claim per person, per event. Automatically committed to Arkiv for decentralized, tamper-evident audit logs.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-950/15">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-sm font-bold">
              03
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-200">
                  Fair Ticket Allocation
                </h4>
                <span className="text-[10px] uppercase font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Arc USDC Escrow
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Eligible participants enter the event allocation pool with native USDC payment settlement and capped secondary resale.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Verification Simulator Box */}
        <div className="mt-6 rounded-2xl border border-violet-500/20 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold text-slate-200 font-mono">
                Interactive Proof Simulator
              </span>
            </div>
            {claimAttempts > 0 && (
              <button
                type="button"
                onClick={resetSimulation}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Test
              </button>
            )}
          </div>

          <div className="mt-3 rounded-xl bg-[#080A12]/90 border border-white/[0.06] p-3 font-mono text-[11px]">
            {simulationState === "idle" && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Waiting for proof submission...</span>
                <span className="text-violet-300">Nullifier: Unset</span>
              </div>
            )}

            {simulationState === "verifying" && (
              <div className="flex items-center gap-2 text-violet-300">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying World ID ZKP & indexing on Arkiv DB-Chain...</span>
              </div>
            )}

            {simulationState === "success" && (
              <div className="space-y-1.5 text-emerald-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>200 OK — Unique Human Verified & Claim Issued</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  World Nullifier: 0x9f4b82d9...7c01 • Event: MMF-2026
                </div>
                <div className="text-[10px] text-indigo-300 flex items-center justify-between">
                  <span>Arkiv Entity: arkiv_alloc_mmf_91a4</span>
                  {onOpenArkivExplorer && (
                    <button
                      type="button"
                      onClick={onOpenArkivExplorer}
                      className="underline hover:text-white"
                    >
                      View on Arkiv DB-Chain
                    </button>
                  )}
                </div>
              </div>
            )}

            {simulationState === "duplicate" && (
              <div className="space-y-1 text-rose-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>409 Conflict — Duplicate Claim Blocked</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Atomic DB constraint triggered: Nullifier already claimed for this event.
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={runSimulation}
              disabled={simulationState === "verifying"}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600/90 hover:bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-violet-600/20 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{claimAttempts === 0 ? "Test World ID Claim" : "Test Duplicate Claim Attempt"}</span>
            </button>
          </div>
        </div>

        {/* Integration Status Footer */}
        <div className="mt-6 border-t border-white/[0.08] pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Protocol Architecture Status</span>
            <span className="font-mono text-emerald-300 font-semibold">Active & Integrated</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/20 p-1.5">
              <span className="text-slate-400 block">World ID</span>
              <span className="text-emerald-300 font-semibold">Proof Ready</span>
            </div>
            <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-1.5">
              <span className="text-slate-400 block">Arkiv</span>
              <span className="text-indigo-300 font-semibold">DB-Chain Ready</span>
            </div>
            <div className="rounded-lg bg-violet-950/30 border border-violet-500/20 p-1.5">
              <span className="text-slate-400 block">Arc</span>
              <span className="text-violet-300 font-semibold">USDC Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
