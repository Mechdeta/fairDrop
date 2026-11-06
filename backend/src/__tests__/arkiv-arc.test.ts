import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("Arkiv DB-Chain Integration API", () => {
  it("GET /api/arkiv/status returns online status and DB-Chain metadata", async () => {
    const res = await request(app).get("/api/arkiv/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ready");
    expect(res.body).toHaveProperty("dbChainId");
    expect(res.body).toHaveProperty("blockHeight");
    expect(res.body.totalEntities).toBeGreaterThan(0);
  });

  it("GET /api/arkiv/records returns queryable decentralized records", async () => {
    const res = await request(app).get("/api/arkiv/records");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("network", "Arkiv DB-Chain");
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBeGreaterThan(0);
  });

  it("GET /api/arkiv/records with filter returns matching entities", async () => {
    const res = await request(app).get("/api/arkiv/records?entityType=event_registry");
    expect(res.status).toBe(200);
    expect(res.body.records.every((r: { entityType: string }) => r.entityType === "event_registry")).toBe(true);
  });

  it("GET /api/arkiv/records/:id returns entity with verified cryptographic proof", async () => {
    const listRes = await request(app).get("/api/arkiv/records");
    const firstEntity = listRes.body.records[0];

    const res = await request(app).get(`/api/arkiv/records/${firstEntity.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("verified", true);
    expect(res.body.entity).toHaveProperty("merkleRoot");
  });
});

describe("Arc Protocol & USDC Settlement API", () => {
  it("GET /api/arc/status returns Arc Layer-1 network information", async () => {
    const res = await request(app).get("/api/arc/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("nativeGasToken", "USDC");
    expect(res.body).toHaveProperty("chainId", 9824);
  });

  it("GET /api/arc/listings returns available resale listings", async () => {
    const res = await request(app).get("/api/arc/listings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(res.body.listings.length).toBeGreaterThan(0);
  });

  it("POST /api/arc/listings rejects scalped price exceeding organizer ceiling", async () => {
    const res = await request(app)
      .post("/api/arc/listings")
      .send({
        ticket_id: "#TKT-9999",
        event_id: "mumbai-music-festival",
        seller_wallet: "0x8F3a890b21a57B9435bCD83e920d0fD143219B21",
        original_price_usdc: 50,
        resale_price_usdc: 150, // 200% markup (Allowed is max +10% = 55 USDC)
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("PRICE_CAP_OR_LISTING_ERROR");
    expect(res.body.message).toContain("exceeds the organizer price cap ceiling");
  });

  it("POST /api/arc/listings accepts fair price within cap ceiling", async () => {
    const res = await request(app)
      .post("/api/arc/listings")
      .send({
        ticket_id: "#TKT-TEST-01",
        event_id: "mumbai-music-festival",
        event_name: "Mumbai Music Festival 2026",
        tier: "General Admission",
        seller_wallet: "0x8F3a890b21a57B9435bCD83e920d0fD143219B21",
        original_price_usdc: 50,
        resale_price_usdc: 52, // +4% markup (allowed)
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.listing.resalePriceUsdc).toBe(52);
  });

  it("POST /api/arc/settle executes atomic settlement and updates listing", async () => {
    const listRes = await request(app).get("/api/arc/listings?status=Available");
    const listingToBuy = listRes.body.listings[0];

    const buyerWallet = "0x9999999999999999999999999999999999999999";
    const res = await request(app)
      .post("/api/arc/settle")
      .send({
        listing_id: listingToBuy.id,
        buyer_wallet: buyerWallet,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settlement).toHaveProperty("txHash");
    expect(res.body.settlement).toHaveProperty("newOwnershipTokenId");
    expect(res.body.settlement.gasToken).toBe("USDC");
  });
});
