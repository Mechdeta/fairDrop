"use client";

import { useEffect, useState } from "react";
import { WalletConnect } from "../src/components/WalletConnect";
import { WorldIdClaimWidget } from "../src/components/WorldIdClaimWidget";
import { fetchEvents } from "../src/integrations/world/world-client";
import type { ClaimRecord, EventItem } from "../src/integrations/world/types";

const principles = [
  {
    number: "01",
    title: "Verify the person",
    description:
      "Attendees prove unique-human eligibility through the official World ID 4.0 flow.",
  },
  {
    number: "02",
    title: "Protect each event",
    description:
      "A verified participant gets strictly one claim per event, enforced atomically by the backend.",
  },
  {
    number: "03",
    title: "Make the result clear",
    description:
      "Clear feedback on proof validation, successful allocation, or duplicate rejection.",
  },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("eth-denver-2027");
  const [userClaims, setUserClaims] = useState<ClaimRecord[]>([]);

  useEffect(() => {
    fetchEvents().then((evs) => {
      if (evs.length > 0) {
        setEvents(evs);
        setSelectedEventId(evs[0].id);
      }
    });
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? events[0];

  const handleClaimSuccess = (claim: ClaimRecord) => {
    setUserClaims((prev) => [claim, ...prev]);
    // Refresh events to update claimed counts
    fetchEvents().then((evs) => setEvents(evs));
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <a href="/" className="flex items-center gap-3" aria-label="FairDrop home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-lg font-black text-white">
            F
          </span>
          <span className="text-lg font-semibold tracking-tight">FairDrop</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            World ID 4.0 Active
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            The Bot-Proof Ticket Marketplace
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            A fairer shot at tickets with{" "}
            <span className="text-violet-400">Proof of Human.</span>
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            FairDrop guarantees 1 ticket per verified human per event using World ID zero-knowledge proofs.
            No scalpers, no multi-accounting bots, and zero personal biometric data stored.
          </p>
        </div>

        {/* Wallet Connection Bar */}
        <div className="mt-8 max-w-3xl">
          <WalletConnect
            walletAddress={walletAddress}
            onWalletChange={(addr) => setWalletAddress(addr)}
          />
        </div>
      </section>

      {/* Main Interactive Flow: Event Selector & Claim Widget */}
      <section className="grid items-start gap-8 pb-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Event Picker Tabs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select an Event
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    selectedEventId === ev.id
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {ev.name.split(" ")[0]} ({ev.id})
                </button>
              ))}
            </div>
          </div>

          {/* World ID 4.0 Interactive Claim Card */}
          {selectedEvent ? (
            <WorldIdClaimWidget
              key={selectedEvent.id}
              event={selectedEvent}
              walletAddress={walletAddress}
              onClaimSuccess={handleClaimSuccess}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 p-8 text-center text-slate-400">
              Loading events...
            </div>
          )}

          {/* User Confirmed Claims */}
          {userClaims.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Your Claimed Tickets ({userClaims.length})
              </h3>
              <div className="mt-3 divide-y divide-white/5">
                {userClaims.map((claim) => (
                  <div key={claim.id} className="py-2.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{claim.eventId}</span>
                      <span className="font-mono text-emerald-400">{claim.nullifierHash}</span>
                    </div>
                    <p className="mt-1 font-mono text-slate-500 text-[11px]">{claim.claimedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Phase 1 Explanatory Sidebar */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Phase 1 Specification</p>
              <h2 className="mt-1 text-xl font-bold text-white">Event-Scoped Protection</h2>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              Verified
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {principles.map((item) => (
              <div key={item.number} className="flex gap-3">
                <span className="pt-0.5 text-xs font-bold text-violet-400">{item.number}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <h4 className="text-xs font-semibold text-slate-300">Security Architecture</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-400">
              <li>Server-signed RP Context with EIP-191 ECDSA nonce.</li>
              <li>World ID API v4 backend proof verification.</li>
              <li>PostgreSQL atomic constraint: <code className="text-violet-300">(event_id, world_nullifier_hash)</code>.</li>
              <li>Rejects duplicate claims within the same event.</li>
              <li>Allows verified human to participate across different events.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-5 text-xs text-slate-500">
        FairDrop · Bot-Proof Event Ticketing · World ID 4.0 Integration
      </footer>
    </main>
  );
}
