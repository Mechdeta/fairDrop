import { Router } from "express";
import { getClaimRepository } from "../db/repository.js";
import { DuplicateClaimError } from "../db/types.js";
import { arkivService } from "../integrations/arkiv/arkiv.service.js";
import { worldService } from "../integrations/world/world.service.js";
import type { WorldIdVerifyRequestBody } from "../integrations/world/world.types.js";

export const claimsRouter = Router();

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * POST /api/claims/verify-and-claim
 * Verifies the submitted World ID proof on the backend, atomically issues a ticket claim,
 * and commits an immutable, queryable record entity to Arkiv's decentralized data layer.
 * Enforces one claim per verified human per event using (event_id, world_nullifier_hash).
 */
claimsRouter.post("/verify-and-claim", async (req, res) => {
  try {
    const { event_id, wallet_address, proof_payload } = req.body as {
      event_id?: string;
      wallet_address?: string;
      proof_payload?: WorldIdVerifyRequestBody;
    };

    // 1. Validate inputs
    if (!event_id || typeof event_id !== "string") {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Field 'event_id' is required.",
      });
    }

    if (!wallet_address || !EVM_ADDRESS_REGEX.test(wallet_address)) {
      return res.status(400).json({
        error: "INVALID_WALLET_ADDRESS",
        message: "A valid EVM wallet address (0x...) is required.",
      });
    }

    if (!proof_payload || typeof proof_payload !== "object") {
      return res.status(400).json({
        error: "INVALID_PROOF_PAYLOAD",
        message: "Proof payload object is required.",
      });
    }

    // 2. Validate that the event exists
    const repository = getClaimRepository();
    const event = await repository.getEventById(event_id);
    if (!event) {
      return res.status(404).json({
        error: "EVENT_NOT_FOUND",
        message: `Event '${event_id}' does not exist.`,
      });
    }

    if (event.claimedTickets >= event.totalTickets) {
      return res.status(400).json({
        error: "EVENT_SOLD_OUT",
        message: "All available tickets for this event have been claimed.",
      });
    }

    // 3. Authoritative server-side proof verification
    const verification = await worldService.verifyProof(proof_payload, event.actionId);
    if (!verification.success || !verification.nullifier) {
      return res.status(400).json({
        error: "INVALID_PROOF",
        message: "World ID proof verification failed.",
        detail: verification.detail ?? verification.error,
      });
    }

    // 4. Atomic claim creation protected by unique constraint on (event_id, world_nullifier_hash)
    try {
      const claim = await repository.createClaim(
        event_id,
        wallet_address,
        verification.nullifier
      );

      // 5. Phase 2: Record allocation on Arkiv decentralized queryable data layer
      const ticketNumber = `#${event.name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()}-${claim.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}`;
      const arkivEntity = await arkivService.recordAllocation({
        eventId: event_id,
        ticketId: ticketNumber,
        walletAddress: wallet_address,
        worldNullifierHash: verification.nullifier,
      });

      return res.status(201).json({
        success: true,
        message: "Ticket successfully claimed and indexed on Arkiv DB-Chain!",
        claim: {
          id: claim.id,
          ticketNumber,
          eventId: claim.eventId,
          walletAddress: claim.walletAddress,
          claimedAt: claim.claimedAt,
          // Mask nullifier hash for safe privacy display
          nullifierHash: `${claim.worldNullifierHash.slice(0, 10)}...${claim.worldNullifierHash.slice(-8)}`,
          arkivEntityId: arkivEntity.id,
          arkivBlockNumber: arkivEntity.blockNumber,
          arkivTxHash: arkivEntity.txHash,
        },
      });
    } catch (claimErr: unknown) {
      if (claimErr instanceof DuplicateClaimError) {
        return res.status(409).json({
          error: "DUPLICATE_CLAIM",
          message: "You have already claimed a ticket for this event with this World ID.",
          eventId: event_id,
        });
      }
      throw claimErr;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return res.status(500).json({
      error: "SERVER_ERROR",
      message,
    });
  }
});

/**
 * GET /api/claims/event/:eventId
 * Returns non-sensitive claim records for an event.
 */
claimsRouter.get("/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const repository = getClaimRepository();
    const claims = await repository.getClaimsForEvent(eventId);

    const safeClaims = claims.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      walletAddress: c.walletAddress,
      claimedAt: c.claimedAt,
      nullifierHash: `${c.worldNullifierHash.slice(0, 10)}...${c.worldNullifierHash.slice(-8)}`,
    }));

    return res.status(200).json({ claims: safeClaims });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch claims.";
    return res.status(500).json({ error: "DATABASE_ERROR", message });
  }
});
