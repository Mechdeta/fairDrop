"use client";

import React from "react";
import {
  ShieldCheck,
  Database,
  Coins,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { PARTNERS_DATA } from "../data/mockData";

export function PartnersSection() {
  const partnerIcons = {
    world: ShieldCheck,
    arkiv: Database,
    arc: Coins,
  };

  return (
    <section id="partners" className="relative scroll-mt-24 py-24 md:py-32">
      {/* Background radial gradients */}
      <div className="pointer-events-none absolute right-10 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute left-10 bottom-1/3 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <Layers className="h-3.5 w-3.5 text-violet-400" />
            <span>Synergistic Web3 Stack</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Three Technologies. One Fairer Ticketing Experience.
          </h2>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            FairDrop connects world-class protocols into a unified pipeline: privacy-preserving human verification, decentralized immutable records, and programmable USDC settlement.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Honest architecture status: Phased implementation roadmap strictly respected</span>
          </div>
        </div>

        {/* 3 Integration Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {PARTNERS_DATA.map((partner) => {
            const Icon = partnerIcons[partner.id];

            return (
              <div
                key={partner.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#141724]/85 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/30"
              >
                {/* Ambient glow in card corner */}
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl group-hover:bg-violet-600/20 transition-colors" />

                <div>
                  {/* Top Bar: Icon & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300 group-hover:scale-105 group-hover:bg-violet-500/20 transition-all">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                          partner.status === "In Development"
                            ? "bg-amber-950/70 text-amber-300 border-amber-500/30"
                            : "bg-slate-900/80 text-slate-400 border-white/10"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            partner.status === "In Development"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-slate-500"
                          }`}
                        />
                        <span>{partner.status}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">
                        {partner.phase}
                      </span>
                    </div>
                  </div>

                  {/* Partner Name & Role */}
                  <div className="mt-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-semibold">
                      ROLE: {partner.role}
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-1 group-hover:text-violet-200 transition-colors">
                      {partner.name}
                    </h3>
                  </div>

                  {/* Short Description */}
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed font-medium">
                    &ldquo;{partner.shortDesc}&rdquo;
                  </p>

                  {/* Full Architecture Description */}
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {partner.fullDesc}
                  </p>

                  {/* Core Capabilities */}
                  <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Target Capabilities
                    </span>
                    {partner.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Documentation Link */}
                <div className="mt-8 pt-4 border-t border-white/[0.08]">
                  <a
                    href={partner.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-white transition-colors group/link"
                  >
                    <span>Read {partner.name} Protocol Docs</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
