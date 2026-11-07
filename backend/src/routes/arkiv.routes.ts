import { Router } from "express";
import { arkivService } from "../integrations/arkiv/arkiv.service.js";
import type {
  ArkivEventFilter,
  ArkivEventPayload,
} from "../integrations/arkiv/arkiv.types.js";

export const arkivRouter = Router();

/**
 * GET /api/arkiv/status
 * Returns network status and indexed entity metrics for the Arkiv DB-Chain Rabdi testnet.
 */
arkivRouter.get("/status", async (_req, res) => {
  try {
    const status = await arkivService.getNetworkStatus();
    return res.status(200).json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch Arkiv status.";
    return res.status(500).json({ error: "ARKIV_ERROR", message });
  }
});

/**
 * GET /api/arkiv/events
 * Queries public event listings from Arkiv DB-Chain with category and city filtering.
 */
arkivRouter.get("/events", async (req, res) => {
  try {
    const { category, city, eventStatus, search, limit, offset } = req.query as {
      category?: string;
      city?: string;
      eventStatus?: string;
      search?: string;
      limit?: string;
      offset?: string;
    };

    const filter: ArkivEventFilter = {
      category,
      city,
      eventStatus,
      search,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };

    const result = await arkivService.listEvents(filter);
    return res.status(200).json({
      success: true,
      network: "Arkiv DB-Chain (Rabdi Testnet)",
      chainId: 7794095,
      source: result.source,
      lastSync: result.lastSync,
      total: result.total,
      events: result.events,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to query Arkiv events.";
    return res.status(500).json({ error: "ARKIV_QUERY_ERROR", message });
  }
});

/**
 * GET /api/arkiv/events/:id
 * Retrieves a single event listing with full public metadata from Arkiv DB-Chain.
 */
arkivRouter.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await arkivService.getEventById(id);

    if (!event) {
      return res.status(404).json({
        error: "EVENT_NOT_FOUND",
        message: `Event '${id}' was not found in Arkiv DB-Chain listings.`,
      });
    }

    return res.status(200).json({
      success: true,
      network: "Arkiv DB-Chain",
      event,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve Arkiv event.";
    return res.status(500).json({ error: "ARKIV_ERROR", message });
  }
});

/**
 * GET /api/arkiv/events/:id/tickets
 * Retrieves public ticket listings and real-time availability for an event from Arkiv.
 */
arkivRouter.get("/events/:id/tickets", async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketType, ticketStatus } = req.query as {
      ticketType?: string;
      ticketStatus?: string;
    };

    const tickets = await arkivService.getTicketsForEvent(id, {
      ticketType,
      ticketStatus,
    });

    return res.status(200).json({
      success: true,
      eventId: id,
      total: tickets.length,
      tickets,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve Arkiv tickets.";
    return res.status(500).json({ error: "ARKIV_ERROR", message });
  }
});

/**
 * POST /api/arkiv/events
 * Publishes a new event listing entity to the Arkiv DB-Chain.
 */
arkivRouter.post("/events", async (req, res) => {
  try {
    const payload = req.body as ArkivEventPayload;

    if (!payload.eventId || !payload.eventName || !payload.organizerWallet) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Fields 'eventId', 'eventName', and 'organizerWallet' are required.",
      });
    }

    const event = await arkivService.createEventEntity(payload);
    return res.status(201).json({
      success: true,
      message: "Event published to Arkiv DB-Chain successfully.",
      event,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Arkiv event.";
    return res.status(500).json({ error: "ARKIV_PUBLISH_ERROR", message });
  }
});

/**
 * POST /api/arkiv/allocations
 * Records a verified ticket allocation reference on Arkiv DB-Chain.
 */
arkivRouter.post("/allocations", async (req, res) => {
  try {
    const { event_id, ticket_id, buyer_wallet, payment_reference } = req.body as {
      event_id?: string;
      ticket_id?: string;
      buyer_wallet?: string;
      payment_reference?: string;
    };

    if (!event_id || !ticket_id || !buyer_wallet) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Fields 'event_id', 'ticket_id', and 'buyer_wallet' are required.",
      });
    }

    const allocation = await arkivService.recordAllocation({
      eventId: event_id,
      ticketId: ticket_id,
      buyerWallet: buyer_wallet,
      paymentReference: payment_reference,
    });

    return res.status(201).json({
      success: true,
      message: "Allocation committed to Arkiv DB-Chain.",
      allocation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record allocation.";
    return res.status(500).json({ error: "ARKIV_ALLOCATION_ERROR", message });
  }
});

/**
 * POST /api/arkiv/outbox/process
 * Triggers background processing of any pending/retried Arkiv writes.
 */
arkivRouter.post("/outbox/process", async (_req, res) => {
  try {
    const result = await arkivService.processOutbox();
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Outbox processing failed.";
    return res.status(500).json({ error: "OUTBOX_ERROR", message });
  }
});

// ==========================================
// BACKWARD COMPATIBILITY FOR PREVIOUS TESTS
// ==========================================

arkivRouter.get("/records", async (req, res) => {
  try {
    const { entityType, eventId, limit } = req.query as {
      entityType?: string;
      eventId?: string;
      limit?: string;
    };

    const records = await arkivService.queryRecords({
      entityType,
      eventId,
      limit: limit ? Number(limit) : undefined,
    });

    return res.status(200).json({
      total: records.length,
      network: "Arkiv DB-Chain",
      records,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to query records.";
    return res.status(500).json({ error: "ARKIV_QUERY_ERROR", message });
  }
});

arkivRouter.get("/records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await arkivService.getEntityById(id);

    if (!result) {
      return res.status(404).json({
        error: "RECORD_NOT_FOUND",
        message: `Entity '${id}' was not found on the Arkiv network.`,
      });
    }

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch record.";
    return res.status(500).json({ error: "ARKIV_ERROR", message });
  }
});
