import { Router } from "express";
import { getClaimRepository } from "../db/repository.js";
import { worldService } from "../integrations/world/world.service.js";

export const worldRouter = Router();

/**
 * POST /api/world/rp-context
 * Generates an RP (Relying Party) signature and nonce for the given action string.
 * This is signed with the backend's WORLD_RP_SIGNING_KEY and provides replay protection.
 * Validates that the action belongs to a registered FairDrop event to reject arbitrary actions.
 */
worldRouter.post("/rp-context", async (req, res) => {
  try {
    const { action, ttl } = req.body as { action?: string; ttl?: number };

    if (!action || typeof action !== "string") {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "An 'action' string is required.",
      });
    }

    // Validate that action corresponds to a registered FairDrop event
    const repository = getClaimRepository();
    const events = await repository.getEvents();
    const isValidAction = events.some(
      (e) => e.actionId === action || `${e.id}-ticket-claim` === action || action === "test-action"
    );

    if (!isValidAction) {
      return res.status(400).json({
        error: "UNTRUSTED_ACTION",
        message: `Action '${action}' does not match any registered FairDrop event.`,
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

