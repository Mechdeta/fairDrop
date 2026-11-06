import { defineSchema, str, addr, u64, dec } from "@arkiv-network/sdk";

/**
 * Event Listing Entity Schema (fairdrop.event.v1)
 * Public, queryable event catalog indexed on Arkiv DB-Chain.
 */
export const EventEntitySchema = defineSchema("fairdrop.event.v1", {
  eventId: str().indexed(),
  organizerWallet: addr().indexed(),
  eventName: str(),
  description: str(),
  category: str().indexed(),
  venue: str(),
  city: str().indexed(),
  startTime: str(),
  endTime: str(),
  ticketPrice: dec(),
  currency: str(),
  totalTicketSupply: u64(),
  availableTicketCount: u64().indexed(),
  eventStatus: str().indexed(), // "active" | "sold_out" | "completed" | "cancelled"
  imageReference: str(),
  createdAt: str(),
  updatedAt: str(),
  schemaVersion: str(),
});

/**
 * Ticket Listing Entity Schema (fairdrop.ticket.v1)
 * Public, queryable ticket inventory for events on Arkiv DB-Chain.
 */
export const TicketEntitySchema = defineSchema("fairdrop.ticket.v1", {
  ticketId: str().indexed(),
  eventId: str().indexed(),
  ticketType: str().indexed(), // "general" | "vip" | "builder" | "student"
  ticketPrice: dec(),
  currency: str(),
  ticketStatus: str().indexed(), // "available" | "reserved" | "claimed"
  sellerOrOrganizerWallet: addr().indexed(),
  createdAt: str(),
  expiresAt: str(),
  schemaVersion: str(),
});

/**
 * Ticket Allocation Entity Schema (fairdrop.allocation.v1)
 * Public, tamper-evident allocation references tying buyer wallets to claimed tickets.
 * Contains NO private personal data or raw World ID proofs.
 */
export const AllocationEntitySchema = defineSchema("fairdrop.allocation.v1", {
  allocationId: str().indexed(),
  eventId: str().indexed(),
  ticketId: str().indexed(),
  buyerWallet: addr().indexed(),
  paymentReference: str(),
  allocationStatus: str().indexed(), // "confirmed" | "cancelled" | "expired"
  createdAt: str(),
  expiresAt: str(),
  schemaVersion: str(),
});

