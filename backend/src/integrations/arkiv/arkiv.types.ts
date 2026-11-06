/**
 * Arkiv Decentralized Data Layer Integration
 * Arkiv is an Ethereum-aligned DB-Chain / Layer-2 decentralized database network
 * that provides wallet-owned entities, queryable attributes over RPC, and tamper-evident logs.
 */

export interface ArkivEntity {
  id: string;
  entityType: "event_registry" | "ticket_allocation" | "resale_record";
  ownerWallet: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  blockNumber: number;
  txHash: string;
  merkleRoot: string;
  ttlSeconds?: number;
}

export interface ArkivAllocationPayload {
  eventId: string;
  ticketId: string;
  walletAddress: string;
  worldNullifierHash: string;
  status: "verified_claimed" | "transferred" | "revoked";
  claimedAt: string;
}

export interface ArkivResalePayload {
  ticketId: string;
  eventId: string;
  sellerWallet: string;
  buyerWallet?: string;
  originalPriceUsdc: number;
  resalePriceUsdc: number;
  status: "listed" | "settled" | "cancelled";
  arcSettlementTxHash?: string;
  listedAt: string;
  settledAt?: string;
}

export interface ArkivQueryFilter {
  entityType?: "event_registry" | "ticket_allocation" | "resale_record";
  eventId?: string;
  walletAddress?: string;
  ticketId?: string;
  limit?: number;
}

export interface ArkivNetworkStatus {
  status: "connected" | "syncing" | "ready";
  network: string;
  rpcUrl: string;
  dbChainId: string;
  blockHeight: number;
  totalEntities: number;
  isMock: boolean;
}
