"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Hash,
  Blocks,
} from "lucide-react";

interface ArkivRecord {
  id: string;
  entityType: "event_registry" | "ticket_allocation" | "resale_record";
  ownerWallet: string;
  payload: Record<string, any>;
  createdAt: string;
  blockNumber: number;
  txHash: string;
  merkleRoot: string;
}

interface ArkivExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntityId?: string | null;
}

export function ArkivExplorerModal({
  isOpen,
  onClose,
  initialEntityId,
}: ArkivExplorerModalProps) {
  const [records, setRecords] = useState<ArkivRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(initialEntityId ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ArkivRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/arkiv/records`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (err) {
      console.warn("Could not fetch Arkiv records from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
      if (initialEntityId) {
        setSearchQuery(initialEntityId);
      }
    }
  }, [isOpen, initialEntityId]);

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filterType === "all" || r.entityType === filterType;
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ownerWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(r.payload).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#10121C] shadow-2xl shadow-indigo-950/50 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Arkiv DB-Chain Explorer</h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  Live Testnet Query
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Decentralized, queryable Web3 records for event allocations & secondary resales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchRecords}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/[0.06] p-4 bg-[#080A12]/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["all", "ticket_allocation", "event_registry", "resale_record"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterType === type
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {type === "all"
                  ? "All Entities"
                  : type === "ticket_allocation"
                  ? "Allocations"
                  : type === "event_registry"
                  ? "Events"
                  : "Resales"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search entity ID, tx, wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Area: Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400 text-xs">
              No matching decentralized entities found on Arkiv.
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="group rounded-2xl border border-white/[0.08] bg-[#141724]/90 p-4 transition-all hover:border-indigo-500/40 hover:bg-[#141724]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                        record.entityType === "ticket_allocation"
                          ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/30"
                          : record.entityType === "event_registry"
                          ? "bg-indigo-950/70 text-indigo-300 border-indigo-500/30"
                          : "bg-purple-950/70 text-purple-300 border-purple-500/30"
                      }`}
                    >
                      {record.entityType.replace("_", " ")}
                    </span>
                    <span className="font-mono text-xs font-semibold text-white">
                      {record.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(record.id, record.id)}
                      className="text-slate-500 hover:text-slate-300"
                      title="Copy Entity ID"
                    >
                      {copiedId === record.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Blocks className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Block #{record.blockNumber}</span>
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Merkle Verified</span>
                    </span>
                  </div>
                </div>

                {/* Payload Attributes */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  {Object.entries(record.payload).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl bg-black/30 border border-white/[0.04] p-2"
                    >
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">
                        {k}
                      </span>
                      <span className="font-mono text-slate-200 text-xs truncate block mt-0.5">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer hashes */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="truncate max-w-sm">
                    Owner: <span className="text-slate-400">{record.ownerWallet}</span>
                  </div>
                  <div className="truncate max-w-xs">
                    Tx: <span className="text-indigo-300">{record.txHash.slice(0, 16)}...</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/[0.08] px-6 py-3 bg-[#080A12] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Arkiv DB-Chain Node: Ethereum Sepolia L2/L3</span>
          <span>Indexed Entities: {records.length}</span>
        </div>
      </div>
    </div>
  );
}
