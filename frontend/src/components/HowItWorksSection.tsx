"use client";

import React, { useState } from "react";
import {
  Compass,
  Fingerprint,
  Sparkles,
  Ticket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "../data/mockData";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const icons = [Compass, Fingerprint, Sparkles, Ticket];

  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24 md:py-32 bg-[#10121C]/50 border-y border-white/[0.05]">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-violet-600/5 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            <span>Architecture & Flow</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            How FairDrop Works
          </h2>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            A frictionless, zero-knowledge four-step protocol built to guarantee every legitimate attendee gets an authentic, transparent shot.
          </p>
        </div>

        {/* 4 Step Cards with Connecting Line on Desktop */}
        <div className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((stepItem, index) => {
            const Icon = icons[index];
            const isSelected = activeStep === index;

            return (
              <div
                key={stepItem.step}
                onClick={() => setActiveStep(index)}
                className={`group relative cursor-pointer flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 backdrop-blur-xl ${
                  isSelected
                    ? "border-violet-500/60 bg-[#141724] shadow-xl shadow-violet-950/50 -translate-y-1"
                    : "border-white/[0.08] bg-[#141724]/70 hover:border-violet-400/30 hover:bg-[#141724]"
                }`}
              >
                {/* Step indicator top */}
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? "bg-violet-600 text-white border-violet-400 shadow-lg shadow-violet-600/30"
                          : "bg-white/[0.03] text-violet-300 border-white/10 group-hover:bg-violet-600/20 group-hover:border-violet-500/30"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <span
                      className={`font-mono text-sm font-bold transition-colors ${
                        isSelected ? "text-violet-300" : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      STEP {stepItem.step}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="mt-6 text-xl font-bold text-white group-hover:text-violet-200 transition-colors">
                    {stepItem.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-violet-400 font-mono">
                    {stepItem.tagline}
                  </p>

                  {/* Description */}
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>

                {/* Bottom detail pill */}
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {stepItem.detail}
                  </p>
                </div>

                {/* Active Indicator Top Edge */}
                {isSelected && (
                  <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Highlight Interactive Card */}
        <div className="mt-12 rounded-3xl border border-violet-500/25 bg-gradient-to-br from-[#141724] via-[#10121C] to-[#080A12] p-6 sm:p-8 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-300">
                <CheckCircle2 className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400">
                  Step {HOW_IT_WORKS_STEPS[activeStep].step} Deep Dive
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  {HOW_IT_WORKS_STEPS[activeStep].title} — {HOW_IT_WORKS_STEPS[activeStep].tagline}
                </h4>
                <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {HOW_IT_WORKS_STEPS[activeStep].detail}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <a
                href="#events"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-violet-600/25"
              >
                <span>Experience Demo Flow</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
