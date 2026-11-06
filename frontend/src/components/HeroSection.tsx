"use client";

import React from "react";
import { ArrowDown, Sparkles, Shield, Users, CheckCircle, ExternalLink } from "lucide-react";
import { HeroPreviewCard } from "./HeroPreviewCard";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32">
      {/* Background radial gradients for subtle soft purple lighting */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 h-[550px] w-[900px] rounded-full bg-gradient-to-tr from-violet-600/15 via-purple-600/20 to-indigo-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-800/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left Column: Hero Content */}
          <div className="flex flex-col items-start text-left">
            {/* Small trust indicator badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 shadow-sm shadow-violet-500/10 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Built for Fairer Event Access • ETHGlobal Mumbai 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:leading-[1.12]">
              A Fairer Shot at the Tickets You{" "}
              <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent underline decoration-violet-500/40 decoration-wavy decoration-from-font">
                Actually Want.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mt-6 text-base text-slate-300 sm:text-lg sm:leading-relaxed max-w-2xl font-normal">
              FairDrop makes limited event ticket distribution more accountable through{" "}
              <span className="text-white font-medium">unique-human verification</span>,{" "}
              <span className="text-white font-medium">transparent allocation</span> and{" "}
              <span className="text-white font-medium">blockchain-powered ticket ownership</span>.
            </p>

            {/* Two CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#events"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition-all duration-200 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] border border-violet-400/30"
              >
                <span>Explore Events</span>
                <ArrowDown className="h-4 w-4" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.08] hover:border-white/25 hover:text-white"
              >
                <span>How FairDrop Works</span>
              </a>
            </div>

            {/* Architecture Assurance Bar */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-6 w-full max-w-lg">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Shield className="h-3.5 w-3.5 text-violet-400" />
                  <span>World ID ZKP</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">Sybil-proof human verification</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Users className="h-3.5 w-3.5 text-purple-400" />
                  <span>1 Human = 1 Pass</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">Event-scoped nullifier lock</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Anti-Scalping</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">Contract-capped resale ceilings</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual / FAIRDROP PROTECTION SYSTEM Preview Card */}
          <div className="flex justify-center lg:justify-end">
            <HeroPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
