/**
 * Arkiv DB-Chain TypeScript Definitions
 * Clean separation between public Web3 entities and internal operational records.
 */

export interface ArkivEventPayload {
  eventId: string;
  organizerWallet: `0x${string}` | string;
  eventName: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  startTime: string;
  endTime: string;
  ticketPrice: string | number;
  currency: string;
  totalTicketSupply: number;
  availableTicketCount: number;
  eventStatus: "active" | "sold_out" | "completed" | "cancelled";
  imageReference: string;
  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: string;
}

export interface ArkivTicketPayload {
  ticketId: string;
  eventId: string;
  ticketType: "general" | "vip" | "builder" | "student";
  ticketPrice: string | number;
  currency: string;
  ticketStatus: "available" | "reserved" | "claimed";
  sellerOrOrganizerWallet: `0x${string}` | string;
  createdAt?: string;
  expiresAt?: string;
  schemaVersion?: string;
}

export interface ArkivAllocationPayload {
  allocationId: string;
  eventId: string;
  ticketId: string;
  buyerWallet: `0x${string}` | string;
  paymentReference: string;
  allocationStatus: "confirmed" | "cancelled" | "expired";
  createdAt?: string;
  expiresAt?: string;
  schemaVersion?: string;
}

export interface ArkivPublicEvent {
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
  isArkivVerified: boolean;
}

export interface ArkivPublicTicket {
  entityKey?: string;
  ticketId: string;
  eventId: string;
  ticketType: string;
  ticketPrice: number;
  currency: string;
  ticketStatus: string;
  sellerOrOrganizerWallet: string;
  createdAt: string;
  expiresAt: string;
  schemaVersion: string;
}

export interface ArkivPublicAllocation {
  entityKey?: string;
  allocationId: string;
  eventId: string;
  ticketId: string;
  buyerWallet: string;
  paymentReference: string;
  allocationStatus: string;
  createdAt: string;
  expiresAt: string;
  schemaVersion: string;
}

export interface ArkivEventFilter {
  category?: string;
  city?: string;
  eventStatus?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ArkivTicketFilter {
  eventId: string;
  ticketType?: string;
  ticketStatus?: string;
  limit?: number;
}

export interface ArkivNetworkStatus {
  status: "ready" | "online" | "degraded" | "standby";
  network: string;
  chainId: number;
  dbChainId?: string;
  rpcUrl: string;
  indexerUrl: string;
  blockHeight: number;
  totalEntities: number;
  isLiveChain: boolean;
  totalEventsTracked: number;
  totalTicketsTracked: number;
  totalAllocationsTracked: number;
  lastSynchronizedAt: string;
}

export interface ArkivOutboxTask {
  id: string;
  entityType: "event" | "ticket" | "allocation" | "patch_availability";
  payload: Record<string, unknown>;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
  status: "pending" | "processing" | "succeeded" | "failed";
}
