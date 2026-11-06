export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  actionId: string;
  totalTickets: number;
  claimedTickets: number;
}

export interface Claim {
  id: string;
  eventId: string;
  walletAddress: string;
  worldNullifierHash: string;
  claimedAt: string;
}

export class DuplicateClaimError extends Error {
  constructor(public readonly eventId: string, public readonly nullifier: string) {
    super(`World ID nullifier ${nullifier} has already claimed a ticket for event ${eventId}.`);
    this.name = "DuplicateClaimError";
  }
}

export interface IClaimRepository {
  init(): Promise<void>;
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  getClaimsForEvent(eventId: string): Promise<Claim[]>;
  createClaim(eventId: string, walletAddress: string, nullifierHash: string): Promise<Claim>;
  clearAllClaims?(): Promise<void>;
}

