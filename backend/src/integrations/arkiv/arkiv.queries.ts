import { eq, desc } from "@arkiv-network/sdk/query";
import { addr } from "@arkiv-network/sdk";
import { getArkivPublicClient } from "./arkiv.client.js";
import {
  EventEntitySchema,
  TicketEntitySchema,
  AllocationEntitySchema,
} from "./arkiv.schemas.js";
import type {
  ArkivEventFilter,
  ArkivTicketFilter,
  ArkivPublicEvent,
  ArkivPublicTicket,
  ArkivPublicAllocation,
} from "./arkiv.types.js";

/**
 * Queries event listing entities from Arkiv DB-Chain using type-safe filter predicates.
 */
export async function queryEventsFromArkiv(
  filter: ArkivEventFilter = {}
): Promise<ArkivPublicEvent[]> {
  const client = getArkivPublicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder: any = client
    .select({
      $key: true,
      eventId: true,
      organizerWallet: true,
      eventName: true,
      description: true,
      category: true,
      venue: true,
      city: true,
      startTime: true,
      endTime: true,
      ticketPrice: true,
      currency: true,
      totalTicketSupply: true,
      availableTicketCount: true,
      eventStatus: true,
      imageReference: true,
      createdAt: true,
      updatedAt: true,
      schemaVersion: true,
    })
    .from(EventEntitySchema);

  if (filter.category) {
    queryBuilder = queryBuilder.where(eq("category", filter.category));
  }
  if (filter.city) {
    queryBuilder = queryBuilder.where(eq("city", filter.city));
  }
  if (filter.eventStatus) {
    queryBuilder = queryBuilder.where(eq("eventStatus", filter.eventStatus));
  }

  queryBuilder = queryBuilder.orderBy(desc("availableTicketCount"));

  if (filter.limit && filter.limit > 0) {
    queryBuilder = queryBuilder.limit(filter.limit);
  }
  if (filter.offset && filter.offset > 0) {
    queryBuilder = queryBuilder.offset(filter.offset);
  }

  const result = await queryBuilder.fetch();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.entities.map((row: any) => ({
    entityKey: row.$key,
    eventId: String(row.eventId?.value || ""),
    organizerWallet: String(row.organizerWallet?.value || ""),
    eventName: String(row.eventName?.value || ""),
    description: String(row.description?.value || ""),
    category: String(row.category?.value || ""),
    venue: String(row.venue?.value || ""),
    city: String(row.city?.value || ""),
    startTime: String(row.startTime?.value || ""),
    endTime: String(row.endTime?.value || ""),
    ticketPrice: Number(row.ticketPrice?.value || 0),
    currency: String(row.currency?.value || "USDC"),
    totalTicketSupply: Number(row.totalTicketSupply?.value || 0),
    availableTicketCount: Number(row.availableTicketCount?.value || 0),
    eventStatus: String(row.eventStatus?.value || "active"),
    imageReference: String(row.imageReference?.value || ""),
    createdAt: String(row.createdAt?.value || ""),
    updatedAt: String(row.updatedAt?.value || ""),
    schemaVersion: String(row.schemaVersion?.value || "v1"),
    isArkivVerified: true,
  }));
}

/**
 * Queries ticket listing entities for a specific event from Arkiv DB-Chain.
 */
export async function queryTicketsFromArkiv(
  filter: ArkivTicketFilter
): Promise<ArkivPublicTicket[]> {
  const client = getArkivPublicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder: any = client
    .select({
      $key: true,
      ticketId: true,
      eventId: true,
      ticketType: true,
      ticketPrice: true,
      currency: true,
      ticketStatus: true,
      sellerOrOrganizerWallet: true,
      createdAt: true,
      expiresAt: true,
      schemaVersion: true,
    })
    .from(TicketEntitySchema)
    .where(eq("eventId", filter.eventId));

  if (filter.ticketType) {
    queryBuilder = queryBuilder.where(eq("ticketType", filter.ticketType));
  }
  if (filter.ticketStatus) {
    queryBuilder = queryBuilder.where(eq("ticketStatus", filter.ticketStatus));
  }

  if (filter.limit && filter.limit > 0) {
    queryBuilder = queryBuilder.limit(filter.limit);
  }

  const result = await queryBuilder.fetch();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.entities.map((row: any) => ({
    entityKey: row.$key,
    ticketId: String(row.ticketId?.value || ""),
    eventId: String(row.eventId?.value || ""),
    ticketType: String(row.ticketType?.value || "general"),
    ticketPrice: Number(row.ticketPrice?.value || 0),
    currency: String(row.currency?.value || "USDC"),
    ticketStatus: String(row.ticketStatus?.value || "available"),
    sellerOrOrganizerWallet: String(row.sellerOrOrganizerWallet?.value || ""),
    createdAt: String(row.createdAt?.value || ""),
    expiresAt: String(row.expiresAt?.value || ""),
    schemaVersion: String(row.schemaVersion?.value || "v1"),
  }));
}

/**
 * Queries allocation entities by buyer wallet or event from Arkiv DB-Chain.
 */
export async function queryAllocationsFromArkiv(params: {
  buyerWallet?: string;
  eventId?: string;
  ticketId?: string;
}): Promise<ArkivPublicAllocation[]> {
  const client = getArkivPublicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder: any = client
    .select({
      $key: true,
      allocationId: true,
      eventId: true,
      ticketId: true,
      buyerWallet: true,
      paymentReference: true,
      allocationStatus: true,
      createdAt: true,
      expiresAt: true,
      schemaVersion: true,
    })
    .from(AllocationEntitySchema);

  if (params.buyerWallet) {
    queryBuilder = queryBuilder.where(eq("buyerWallet", addr(params.buyerWallet as `0x${string}`)));
  }
  if (params.eventId) {
    queryBuilder = queryBuilder.where(eq("eventId", params.eventId));
  }
  if (params.ticketId) {
    queryBuilder = queryBuilder.where(eq("ticketId", params.ticketId));
  }

  const result = await queryBuilder.fetch();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.entities.map((row: any) => ({
    entityKey: row.$key,
    allocationId: String(row.allocationId?.value || ""),
    eventId: String(row.eventId?.value || ""),
    ticketId: String(row.ticketId?.value || ""),
    buyerWallet: String(row.buyerWallet?.value || ""),
    paymentReference: String(row.paymentReference?.value || ""),
    allocationStatus: String(row.allocationStatus?.value || "confirmed"),
    createdAt: String(row.createdAt?.value || ""),
    expiresAt: String(row.expiresAt?.value || ""),
    schemaVersion: String(row.schemaVersion?.value || "v1"),
  }));
}
