import { Router } from "express";
import { worldService } from "../integrations/world/world.service.js";

export const worldRouter = Router();

/**
 * POST /api/world/rp-context
 * Generates an RP (Relying Party) signature and nonce for the given action string.
 * This is signed with the backend's WORLD_RP_SIGNING_KEY and provides replay protection.
 */
worldRouter.post("/rp-context", (req, res) => {
  try {
    const { action, ttl } = req.body as { action?: string; ttl?: number };

    if (!action || typeof action !== "string") {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "An 'action' string is required.",
      });
    }

    const rpContext = worldService.generateRpContext(action, ttl);
    return res.status(200).json(rpContext);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate RP context.";
    return res.status(500).json({
      error: "RP_CONTEXT_GENERATION_FAILED",
      message,
    });
  }
});

