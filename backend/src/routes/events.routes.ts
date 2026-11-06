import { Router } from "express";
import { getClaimRepository } from "../db/repository.js";

export const eventsRouter = Router();

/**
 * GET /api/events
 * Returns the list of available ticketed events.
 */
eventsRouter.get("/", async (_req, res) => {
  try {
    const repository = getClaimRepository();
    const events = await repository.getEvents();
    return res.status(200).json({ events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch events.";
    return res.status(500).json({ error: "DATABASE_ERROR", message });
  }
});

/**
 * GET /api/events/:id
 * Returns a single event by ID.
 */
eventsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const repository = getClaimRepository();
    const event = await repository.getEventById(id);

    if (!event) {
      return res.status(404).json({
        error: "EVENT_NOT_FOUND",
        message: `Event '${id}' not found.`,
      });
    }

    return res.status(200).json({ event });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch event.";
    return res.status(500).json({ error: "DATABASE_ERROR", message });
  }
});

