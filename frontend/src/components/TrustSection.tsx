"use client";

import React from "react";
import {
  UserCheck,
  Eye,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { TRUST_BENEFITS } from "../data/mockData";

export function TrustSection() {
  const benefitIcons = [UserCheck, Eye, KeyRound, ShieldCheck];

  return (
    <section id="trust" className="relative scroll-mt-24 py-24 md:py-32">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            <span>Guaranteed Fairness</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ticketing Should Be Fair by Design.
          </h2>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Traditional ticketing systems rely on opaque queues, capture-prone CAPTCHAs, and corporate resale cartels. FairDrop substitutes blind trust with verifiable cryptographic boundaries.
          </p>

          <div className="mt-3 text-xs text-slate-400">
            Engineered through defense-in-depth: privacy-preserving personhood, atomic claim limits, and bounded resale.
          </div>
        </div>

        {/* 4 Important Benefits Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_BENEFITS.map((benefit, index) => {
            const Icon = benefitIcons[index];

            return (
              <div
                key={benefit.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#141724]/90 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/30"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300 group-hover:bg-violet-500/20 group-hover:scale-105 transition-all">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="mt-6 block text-xs font-mono font-semibold uppercase tracking-wider text-violet-400">
                    {benefit.short}
                  </span>

                  <h3 className="mt-1 text-xl font-bold text-white group-hover:text-violet-200 transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
                  {benefit.bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Matrix: Legacy Ticketing vs FairDrop */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#10121C]/80 backdrop-blur-2xl shadow-2xl">
          <div className="border-b border-white/[0.06] p-6 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">
              Architectural Comparison: Legacy Ticketing vs. FairDrop
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              How cryptographic primitives eliminate the structural loopholes exploited by automated scalper cartels
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-black/20 text-slate-400 uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Capability / Vector</th>
                  <th className="py-3.5 px-6 text-slate-400">Legacy Ticketing Platforms</th>
                  <th className="py-3.5 px-6 text-violet-300">FairDrop Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">
                    Bot Defense Mechanism
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <div className="flex items-center gap-2 text-rose-400">
                      <X className="h-4 w-4 shrink-0" />
                      <span>SMS & CAPTCHAs (Bypassed by AI & SMS farms)</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>World ID Zero-Knowledge Proofs of Personhood</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-white">
                    Per-Event Claim Limit
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <div className="flex items-center gap-2 text-rose-400">
                      <X className="h-4 w-4 shrink-0" />
                      <span>Tied to email/credit card (Easily multiplied by bots)</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Cryptographic nullifier hash (Strict 1 claim/event)</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-white">
                    Allocation Queue Transparency
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <div className="flex items-center gap-2 text-rose-400">
                      <X className="h-4 w-4 shrink-0" />
                      <span>Black-box server queue with broker reserves</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Queryable, auditable decentralized record log</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-white">
                    Secondary Market Resale
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <div className="flex items-center gap-2 text-rose-400">
                      <X className="h-4 w-4 shrink-0" />
                      <span>Unregulated 5x–15x predatory scalper markups</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Smart contract price caps & verified buyer transfers</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
