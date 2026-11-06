import { Router } from "express";
import { arkivService } from "../integrations/arkiv/arkiv.service.js";
import type { ArkivQueryFilter } from "../integrations/arkiv/arkiv.types.js";

export const arkivRouter = Router();

/**
 * GET /api/arkiv/status
 * Returns network status and indexed entity metrics for the Arkiv DB-Chain.
 */
arkivRouter.get("/status", (_req, res) => {
  try {
    const status = arkivService.getNetworkStatus();
    return res.status(200).json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch Arkiv status.";
    return res.status(500).json({ error: "ARKIV_ERROR", message });
  }
});

/**
 * GET /api/arkiv/records
 * Queries decentralized records from Arkiv using SQL-like filtering.
 */
arkivRouter.get("/records", async (req, res) => {
  try {
    const { entityType, eventId, walletAddress, ticketId, limit } = req.query as {
      entityType?: "event_registry" | "ticket_allocation" | "resale_record";
      eventId?: string;
      walletAddress?: string;
      ticketId?: string;
      limit?: string;
    };

    const filter: ArkivQueryFilter = {
      entityType,
      eventId,
      walletAddress,
      ticketId,
      limit: limit ? Number(limit) : undefined,
    };

    const records = await arkivService.queryRecords(filter);
    return res.status(200).json({
      total: records.length,
      network: "Arkiv DB-Chain",
      records,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to query Arkiv records.";
    return res.status(500).json({ error: "ARKIV_QUERY_ERROR", message });
  }
});

/**
 * GET /api/arkiv/records/:id
 * Fetches an entity by ID along with its cryptographic Merkle proof.
 */
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
    const message = err instanceof Error ? err.message : "Failed to fetch Arkiv record.";
    return res.status(500).json({ error: "ARKIV_ERROR", message });
  }
});
