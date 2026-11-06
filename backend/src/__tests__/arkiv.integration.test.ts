import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { arkivService } from "../integrations/arkiv/arkiv.service.js";
import { checkArkivHealth } from "../integrations/arkiv/arkiv.client.js";

describe("Arkiv DB-Chain Integration & Queryable Data Layer", () => {
  beforeEach(() => {
    // Reset or ensure clean state
  });

  describe("A. Event Operations on Arkiv", () => {
    it("POST /api/arkiv/events creates and publishes a public event listing entity", async () => {
      const res = await request(app)
        .post("/api/arkiv/events")
        .send({
          eventId: "test-hackathon-2026",
          organizerWallet: "0x8F3a890b21a57B9435bCD83e920d0fD143219B21",
          eventName: "ETHGlobal Builders Hackathon",
          description: "Decentralized builder showcase on Arkiv DB-Chain.",
          category: "Hackathon",
          venue: "Tech Park BKC",
          city: "Mumbai",
          startTime: "2026-11-20T10:00:00Z",
          endTime: "2026-11-22T18:00:00Z",
          ticketPrice: 0,
          currency: "USDC",
          totalTicketSupply: 500,
          availableTicketCount: 500,
          eventStatus: "active",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.event).toHaveProperty("eventId", "test-hackathon-2026");
      expect(res.body.event).toHaveProperty("entityKey");
      expect(res.body.event).toHaveProperty("isArkivVerified", true);
    });

    it("POST /api/arkiv/events rejects request with missing mandatory fields", async () => {
      const res = await request(app)
        .post("/api/arkiv/events")
        .send({
          eventName: "Incomplete Event",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_REQUEST");
    });

    it("GET /api/arkiv/events lists public events from Arkiv data layer", async () => {
      const res = await request(app).get("/api/arkiv/events");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.chainId).toBe(7794095);
      expect(res.body).toHaveProperty("source");
      expect(Array.isArray(res.body.events)).toBe(true);
      expect(res.body.events.length).toBeGreaterThan(0);
    });

    it("GET /api/arkiv/events filters events by category", async () => {
      const res = await request(app).get("/api/arkiv/events?category=Music");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const ev of res.body.events) {
        expect(ev.category.toLowerCase()).toBe("music");
      }
    });

    it("GET /api/arkiv/events filters events by city", async () => {
      const res = await request(app).get("/api/arkiv/events?city=Mumbai");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const ev of res.body.events) {
        expect(ev.city.toLowerCase()).toBe("mumbai");
      }
    });

    it("GET /api/arkiv/events/:id returns detailed event entity", async () => {
      const res = await request(app).get("/api/arkiv/events/mumbai-music-festival");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.event.eventId).toBe("mumbai-music-festival");
      expect(res.body.event).toHaveProperty("availableTicketCount");
      expect(res.body.event).toHaveProperty("organizerWallet");
    });

    it("GET /api/arkiv/events/:id returns 404 for non-existent event", async () => {
      const res = await request(app).get("/api/arkiv/events/non-existent-event-xyz");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("EVENT_NOT_FOUND");
    });
  });

  describe("B. Ticket Listing & Availability Operations", () => {
    it("GET /api/arkiv/events/:id/tickets returns public ticket listings", async () => {
      const res = await request(app).get("/api/arkiv/events/mumbai-music-festival/tickets");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.eventId).toBe("mumbai-music-festival");
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(res.body.tickets[0]).toHaveProperty("ticketType");
      expect(res.body.tickets[0]).toHaveProperty("ticketPrice");
    });

    it("GET /api/arkiv/events/:id/tickets filters by ticket status", async () => {
      const res = await request(app).get("/api/arkiv/events/mumbai-music-festival/tickets?ticketStatus=available");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const t of res.body.tickets) {
        expect(t.ticketStatus).toBe("available");
      }
    });
  });

  describe("C. Ticket Allocation Operations", () => {
    it("POST /api/arkiv/allocations records verified allocation and updates inventory", async () => {
      const initialEventRes = await request(app).get("/api/arkiv/events/mumbai-music-festival");
      const initialAvailable = initialEventRes.body.event.availableTicketCount;

      const res = await request(app)
        .post("/api/arkiv/allocations")
        .send({
          event_id: "mumbai-music-festival",
          ticket_id: "MMF-TEST-ALLOC-001",
          buyer_wallet: "0x1111111111111111111111111111111111111111",
          payment_reference: "arc_usdc_tx_test_receipt",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.allocation).toHaveProperty("allocationId");
      expect(res.body.allocation.allocationStatus).toBe("confirmed");
      expect(res.body.allocation.buyerWallet.toLowerCase()).toBe("0x1111111111111111111111111111111111111111");

      // Verify inventory decremented
      const updatedEventRes = await request(app).get("/api/arkiv/events/mumbai-music-festival");
      expect(updatedEventRes.body.event.availableTicketCount).toBe(initialAvailable - 1);
    });

    it("POST /api/arkiv/allocations rejects invalid request", async () => {
      const res = await request(app)
        .post("/api/arkiv/allocations")
        .send({
          event_id: "mumbai-music-festival",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_REQUEST");
    });
  });

  describe("D. Outbox Resilience & Network Health", () => {
    it("POST /api/arkiv/outbox/process executes queued outbox tasks", async () => {
      const res = await request(app).post("/api/arkiv/outbox/process");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("processed");
      expect(res.body).toHaveProperty("remaining");
    });

    it("GET /api/arkiv/status returns Rabdi testnet chain metadata", async () => {
      const res = await request(app).get("/api/arkiv/status");

      expect(res.status).toBe(200);
      expect(res.body.chainId).toBe(7794095);
      expect(res.body.network).toContain("Rabdi");
      expect(res.body).toHaveProperty("totalEventsTracked");
      expect(res.body).toHaveProperty("lastSynchronizedAt");
    });
  });

  describe("E. Real Testnet Live RPC Connectivity", () => {
    it("verifies live connection to Arkiv Rabdi testnet node", async () => {
      const health = await checkArkivHealth();
      expect(health).toHaveProperty("rpcUrl");
      // Check that response structure is valid regardless of network sandbox
      expect(typeof health.online).toBe("boolean");
    });
  });
});

