import type { IDKitResult, RpContext } from "@worldcoin/idkit";

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  actionId: string;
  totalTickets: number;
  claimedTickets: number;
}

export interface ClaimRecord {
  id: string;
  eventId: string;
  walletAddress: string;
  claimedAt: string;
  nullifierHash: string;
}

export interface ClaimSubmissionParams {
  eventId: string;
  walletAddress: string;
  proofPayload: IDKitResult;
}

export interface ClaimResponse {
  success: boolean;
  message: string;
  claim?: ClaimRecord;
  error?: string;
  detail?: string;
  eventId?: string;
}

