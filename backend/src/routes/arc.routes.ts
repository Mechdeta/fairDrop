import { Router } from "express";
import { arcService } from "../integrations/arc/arc.service.js";

export const arcRouter = Router();

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * GET /api/arc/status
 * Returns network status and configuration for Circle's Arc Layer-1.
 */
arcRouter.get("/status", (_req, res) => {
  try {
    const status = arcService.getNetworkStatus();
    return res.status(200).json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch Arc status.";
    return res.status(500).json({ error: "ARC_ERROR", message });
  }
});

/**
 * GET /api/arc/listings
 * Returns active secondary resale listings on the Arc escrow contract.
 */
arcRouter.get("/listings", (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const listings = arcService.getListings(status);
    return res.status(200).json({ total: listings.length, listings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch Arc listings.";
    return res.status(500).json({ error: "ARC_ERROR", message });
  }
});

/**
 * GET /api/arc/listings/:id
 * Returns a specific resale listing.
 */
arcRouter.get("/listings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const listing = arcService.getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: "LISTING_NOT_FOUND", message: `Listing '${id}' not found.` });
    }
    return res.status(200).json({ listing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch listing.";
    return res.status(500).json({ error: "ARC_ERROR", message });
  }
});

/**
 * POST /api/arc/listings
 * Lists a verified ticket on the Arc secondary market under organizer price caps.
 */
arcRouter.post("/listings", async (req, res) => {
  try {
    const {
      ticket_id,
      event_id,
      event_name,
      tier,
      seller_wallet,
      original_price_usdc,
      resale_price_usdc,
      organizer_royalty_percent,
    } = req.body as {
      ticket_id?: string;
      event_id?: string;
      event_name?: string;
      tier?: string;
      seller_wallet?: string;
      original_price_usdc?: number;
      resale_price_usdc?: number;
      organizer_royalty_percent?: number;
    };

    if (!ticket_id || !event_id || !seller_wallet) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Fields 'ticket_id', 'event_id', and 'seller_wallet' are required.",
      });
    }

    if (!EVM_ADDRESS_REGEX.test(seller_wallet)) {
      return res.status(400).json({
        error: "INVALID_WALLET_ADDRESS",
        message: "Valid EVM seller wallet is required.",
      });
    }

    const listing = await arcService.createListing({
      ticketId: ticket_id,
      eventId: event_id,
      eventName: event_name ?? "Verified FairDrop Event",
      tier: tier ?? "General Admission",
      sellerWallet: seller_wallet,
      originalPriceUsdc: Number(original_price_usdc ?? 0),
      resalePriceUsdc: Number(resale_price_usdc ?? 0),
      organizerRoyaltyPercent: organizer_royalty_percent ? Number(organizer_royalty_percent) : 5,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket successfully listed on Arc Escrow contract.",
      listing,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create listing.";
    return res.status(400).json({ error: "PRICE_CAP_OR_LISTING_ERROR", message });
  }
});

/**
 * POST /api/arc/settle
 * Executes atomic purchase and settlement with native USDC on Arc.
 */
arcRouter.post("/settle", async (req, res) => {
  try {
    const { listing_id, buyer_wallet, tx_hash } = req.body as {
      listing_id?: string;
      buyer_wallet?: string;
      tx_hash?: string;
    };

    if (!listing_id || !buyer_wallet) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Fields 'listing_id' and 'buyer_wallet' are required.",
      });
    }

    if (!EVM_ADDRESS_REGEX.test(buyer_wallet)) {
      return res.status(400).json({
        error: "INVALID_WALLET_ADDRESS",
        message: "Valid EVM buyer wallet is required.",
      });
    }

    const result = await arcService.executeSettlement({
      listingId: listing_id,
      buyerWallet: buyer_wallet,
      txHash: tx_hash,
    });

    return res.status(200).json({
      success: true,
      message: "Resale successfully settled on Arc Layer-1! Ownership transferred atomically.",
      settlement: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Settlement failed.";
    return res.status(400).json({ error: "SETTLEMENT_ERROR", message });
  }
});

/**
 * GET /api/arc/balance/:address
 * Returns USDC balance on Arc Layer-1.
 */
arcRouter.get("/balance/:address", (req, res) => {
  try {
    const { address } = req.params;
    const balance = arcService.getWalletBalance(address);
    return res.status(200).json({
      address,
      token: "USDC",
      balance: balance.toFixed(2),
      network: "Arc Layer-1",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch balance.";
    return res.status(500).json({ error: "BALANCE_ERROR", message });
  }
});
