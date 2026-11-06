"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ArrowUpRight,
  Code2,
  Heart,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export function Footer() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/health`);
        setApiOnline(res.ok);
      } catch {
        setApiOnline(false);
      }
    };
    checkApi();
  }, []);

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#080A12] pt-16 pb-12 overflow-hidden">
      {/* Subtle bottom lighting */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-full max-w-5xl bg-gradient-to-t from-violet-600/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 p-[1px] shadow-lg shadow-violet-500/25">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#080A12]/90">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-200 to-purple-400">
                    F
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  FairDrop
                </span>
                <span className="block text-[11px] font-mono text-violet-400">
                  The Bot-Proof Ticket Marketplace
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm">
              Making limited event ticket distribution accountable through unique-human verification, transparent allocation, and blockchain-powered ownership.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                <span>ETHGlobal Mumbai 2026</span>
              </span>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    apiOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span className="font-mono text-[11px]">
                  {apiOnline ? "Express API: Online (4000)" : "Express API: Standby"}
                </span>
              </div>
            </div>
          </div>

          {/* Links 1: Platform */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="#events"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Discover Events
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#marketplace"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Secondary Marketplace
                </a>
              </li>
              <li>
                <a
                  href="#trust"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Trust & Security
                </a>
              </li>
            </ul>
          </div>

          {/* Links 2: Ecosystem Partners */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Partner Technologies
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://docs.world.org/world-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-violet-300 transition-colors"
                >
                  <span>World Documentation</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://arkiv.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-violet-300 transition-colors"
                >
                  <span>Arkiv Documentation</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://arc.market"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-violet-300 transition-colors"
                >
                  <span>Arc Documentation</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Links 3: Project & Specs */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Specifications
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Phase 1: World ID ZKP (Active)</span>
              </li>
              <li>
                <span className="text-slate-500">Phase 2: Arkiv Records (Planned)</span>
              </li>
              <li>
                <span className="text-slate-500">Phase 3: Arc Settlement (Planned)</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://github.com/Mechdeta/fairDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <Code2 className="h-4 w-4 text-violet-400" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tagline & Copyright */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="font-medium text-slate-400">
            &ldquo;Built for Fairer Event Access.&rdquo;
          </p>

          <p>
            FairDrop · Developed for ETHGlobal Mumbai 2026. Built in phases, with people first.
          </p>
        </div>
      </div>
    </footer>
  );
}
