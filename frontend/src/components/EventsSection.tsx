"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { DEMO_EVENTS, FairDropEvent } from "../data/mockData";

interface EventsSectionProps {
  onSelectEvent: (event: FairDropEvent) => void;
}

export function EventsSection({ onSelectEvent }: EventsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = DEMO_EVENTS.filter((event) => {
    const matchesFilter =
      activeFilter === "all" || event.category === activeFilter;
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="events" className="relative scroll-mt-24 py-24 md:py-32">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>Curated Demonstration Events</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Discover Events Worth Showing Up For
          </h2>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Every ticket allocation is safeguarded by World ID unique-human verification. Zero bot cart-hoarding, zero automated scalper syndicates.
          </p>

          {/* Clearly labeled mock data disclaimer */}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span>Demonstration seed data for ETHGlobal Mumbai presentation</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl border border-white/10 bg-[#10121C]/80 backdrop-blur-md">
            {[
              { id: "all", label: "All Events" },
              { id: "music", label: "Music & Live" },
              { id: "tech", label: "Web3 & Tech" },
              { id: "conference", label: "Conferences" },
              { id: "campus", label: "Campus & Youth" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  activeFilter === tab.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#10121C]/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredEvents.map((event) => {
            const percentClaimed = Math.round(
              (event.claimedTickets / event.totalTickets) * 100
            );

            return (
              <div
                key={event.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#141724]/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/40"
              >
                {/* Banner Image with hover zoom */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141724] via-transparent to-black/30" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md border ${
                        event.statusType === "open"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                          : event.statusType === "verified"
                          ? "bg-violet-950/80 text-violet-300 border-violet-500/30"
                          : "bg-amber-950/80 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      <span>{event.status}</span>
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3">
                    <div className="rounded-xl border border-white/10 bg-black/70 px-3 py-1 backdrop-blur-md">
                      <span className="text-xs font-bold text-white font-mono">
                        {event.priceUsdc === 0 ? "Free" : `${event.priceUsdc} USDC`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    {/* Category Label */}
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                      {event.categoryLabel}
                    </p>

                    {/* Event Name */}
                    <h3 className="mt-1 text-lg font-bold text-white line-clamp-1 group-hover:text-violet-200 transition-colors">
                      {event.name}
                    </h3>

                    {/* Event Meta */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Ticket Availability Bar */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>Availability</span>
                        <span className="font-mono text-violet-300 font-semibold">
                          {event.claimedTickets} / {event.totalTickets} ({percentClaimed}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-500"
                          style={{ width: `${percentClaimed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectEvent(event)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] hover:bg-violet-600 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-all duration-200 border border-white/10 hover:border-violet-500/40 group/btn"
                    >
                      <span>View Details & Claim</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-[#141724]/60 p-12 text-center">
            <p className="text-slate-400 text-sm">
              No demonstration events match your search query. Try another keyword or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
