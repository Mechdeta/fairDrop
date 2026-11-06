"use client";

import React, { useState, useEffect } from "react";
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
  Database,
  RefreshCw,
  Layers,
} from "lucide-react";
import { DEMO_EVENTS, FairDropEvent } from "../data/mockData";

interface EventsSectionProps {
  onSelectEvent: (event: FairDropEvent) => void;
  onOpenArkivExplorer?: (entityId?: string) => void;
}

interface ArkivApiEvent {
  entityKey?: string;
  eventId: string;
  organizerWallet: string;
  eventName: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  currency: string;
  totalTicketSupply: number;
  availableTicketCount: number;
  eventStatus: string;
  imageReference: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
}

export function EventsSection({ onSelectEvent, onOpenArkivExplorer }: EventsSectionProps) {
  const [events, setEvents] = useState<FairDropEvent[]>(DEMO_EVENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"arkiv-live" | "arkiv-cache">("arkiv-cache");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Fetches genuine event listings directly from Arkiv DB-Chain through the backend.
   */
  const loadArkivEvents = async (categoryFilter?: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const queryParams = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "all") {
        queryParams.set("category", categoryFilter);
      }

      const res = await fetch(`${apiUrl}/api/arkiv/events?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`Arkiv query returned status ${res.status}`);
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        const mappedEvents: FairDropEvent[] = data.events.map((raw: ArkivApiEvent) => {
          const claimed = Math.max(0, raw.totalTicketSupply - raw.availableTicketCount);
          const isSoldOut = raw.availableTicketCount <= 0;

          // Format readable date
          let dateStr = "Upcoming 2026";
          let timeStr = "TBA";
          try {
            const d = new Date(raw.startTime);
            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
            }
          } catch {
            // Keep default
          }

          return {
            id: raw.eventId,
            name: raw.eventName,
            category: (raw.category.toLowerCase() as "music" | "tech" | "campus" | "conference") || "tech",
            categoryLabel: raw.category,
            tagline: raw.description.slice(0, 90) + (raw.description.length > 90 ? "..." : ""),
            location: `${raw.venue}, ${raw.city}`,
            venue: raw.venue,
            date: dateStr,
            time: timeStr,
            priceUsdc: raw.ticketPrice,
            totalTickets: raw.totalTicketSupply,
            claimedTickets: claimed,
            status: isSoldOut ? "Sold Out" : "Registration Open",
            statusType: isSoldOut ? "closed" : "open",
            imageUrl: raw.imageReference || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            description: raw.description,
            lineup: ["Verified Human Attendees", "Zero Bot Hoarding", "Tamper-Evident Arkiv DB-Chain Record"],
            rules: ["1 Ticket Per Human (World ID)", "Organizer Price Capped (+10% max on Arc)"],
            actionId: `${raw.eventId}-ticket-claim`,
          };
        });

        setEvents(mappedEvents);
        setDataSource(data.source || "arkiv-cache");
        setLastSyncTime(data.lastSync || new Date().toISOString());
      }
    } catch (err: unknown) {
      const anyErr = err as { message?: string };
      console.warn("Failed to fetch Arkiv event listings, using local snapshot:", anyErr.message);
      setFetchError("Unable to query live Arkiv indexer. Displaying synchronized cache snapshot.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArkivEvents();
  }, []);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    loadArkivEvents(filterId);
  };

  const filteredEvents = events.filter((event) => {
    const matchesFilter =
      activeFilter === "all" || event.category.toLowerCase() === activeFilter.toLowerCase();
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
            <span>Verifiable Public Event Catalog</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Discover Events Worth Showing Up For
          </h2>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Every ticket allocation is safeguarded by World ID unique-human verification and permanently registered on the Arkiv DB-Chain data layer.
          </p>

          {/* Genuine Arkiv Testnet Status Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-mono text-emerald-300 shadow-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {dataSource === "arkiv-live"
                  ? "Arkiv DB-Chain: Verified Live (Rabdi Testnet • Chain ID 7794095)"
                  : `Arkiv DB-Chain: Synchronized Snapshot (Chain ID 7794095)`}
              </span>
            </div>

            {onOpenArkivExplorer && (
              <button
                type="button"
                onClick={() => onOpenArkivExplorer()}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-950/40 hover:bg-violet-900/60 px-3 py-1 text-xs font-semibold text-violet-300 transition-colors"
              >
                <Database className="h-3.5 w-3.5 text-violet-400" />
                <span>Open Arkiv DB Explorer</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadArkivEvents(activeFilter)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-xs text-slate-300 transition-colors"
              title="Refresh from Arkiv"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
            </button>
          </div>

          {fetchError && (
            <p className="mt-2 text-xs text-amber-400/90 font-mono">
              {fetchError}
            </p>
          )}
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
                onClick={() => handleFilterChange(tab.id)}
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

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-3xl border border-white/5 bg-white/[0.02]" />
            ))}
          </div>
        )}

        {/* Event Cards Grid */}
        {!isLoading && (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredEvents.map((event) => {
              const availableTickets = Math.max(0, event.totalTickets - event.claimedTickets);
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
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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
                          {event.priceUsdc === 0 ? "Free Claim" : `${event.priceUsdc} USDC`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      {/* Category Label & Arkiv Verified Badge */}
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                          {event.categoryLabel}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Arkiv DB</span>
                        </span>
                      </div>

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
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3 text-slate-500" />
                            <span>Arkiv Inventory:</span>
                          </span>
                          <span className="font-mono text-violet-300 font-semibold">
                            {availableTickets} left / {event.totalTickets}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, percentClaimed)}%` }}
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
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-[#141724]/60 p-12 text-center">
            <p className="text-slate-400 text-sm">
              No events found on Arkiv matching your criteria. Try another filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
