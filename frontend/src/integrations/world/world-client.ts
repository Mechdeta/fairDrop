import type { RpContext } from "@worldcoin/idkit";
import type { ClaimResponse, ClaimSubmissionParams, EventItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Requests a backend-signed Relying Party (RP) context for the target action.
 * World ID 4.0 requires this server-side signature to prevent frontend request spoofing.
 */
export async function fetchRpContext(action: string): Promise<RpContext> {
  const response = await fetch(`${API_BASE_URL}/api/world/rp-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `Failed to fetch RP context from backend (HTTP ${response.status})`
    );
  }

  const data = await response.json();
  return {
    rp_id: data.rp_id,
    nonce: data.nonce,
    created_at: data.created_at,
    expires_at: data.expires_at,
    signature: data.signature,
  };
}

/**
 * Submits the client-side IDKit verification result to the backend for authoritative verification
 * and atomic ticket claim creation.
 */
export async function submitClaimProof(params: ClaimSubmissionParams): Promise<ClaimResponse> {
  const response = await fetch(`${API_BASE_URL}/api/claims/verify-and-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: params.eventId,
      wallet_address: params.walletAddress,
      proof_payload: params.proofPayload,
    }),
  });

  const data = (await response.json()) as ClaimResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? `Claim rejected (HTTP ${response.status})`,
      error: data.error,
      detail: data.detail,
      eventId: data.eventId,
    };
  }

  return data;
}

/**
 * Fetches available events from the FairDrop backend.
 */
export async function fetchEvents(): Promise<EventItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load events: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.events ?? [];
  } catch (err) {
    console.warn("Could not fetch events from backend API, using local fallback seed:", err);
    return [
      {
        id: "eth-denver-2027",
        name: "ETHDenver 2027 Main Stage Pass",
        description: "Exclusive access to the largest Web3 #BUIDLathon and developer summit.",
        date: "February 26 – March 1, 2027",
        location: "National Western Complex, Denver, CO",
        actionId: "eth-denver-ticket-claim",
        totalTickets: 250,
        claimedTickets: 0,
      },
      {
        id: "devcon-2027",
        name: "Devcon VIII Global Builder Pass",
        description: "The premier Ethereum gathering for developers, researchers, and creators.",
        date: "October 14 – 17, 2027",
        location: "Convention Center, Tokyo, Japan",
        actionId: "devcon-ticket-claim",
        totalTickets: 150,
        claimedTickets: 0,
      },
    ];
  }
}

