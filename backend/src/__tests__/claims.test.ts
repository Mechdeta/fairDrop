import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { getClaimRepository } from "../db/repository.js";

const TEST_SIGNING_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_RP_ID = "rp_fairdrop_test";

process.env.WORLD_RP_SIGNING_KEY = TEST_SIGNING_KEY;
process.env.WORLD_RP_ID = TEST_RP_ID;
process.env.WORLD_MOCK_VERIFICATION = "true";

describe("World ID 4.0 & Claims API", () => {
  beforeEach(async () => {
    const repo = getClaimRepository();
    if (repo.clearAllClaims) {
      await repo.clearAllClaims();
    }
  });

  describe("POST /api/world/rp-context", () => {
    it("generates a valid RP context with signature and nonce for an action", async () => {
      const response = await request(app)
        .post("/api/world/rp-context")
        .send({ action: "eth-denver-ticket-claim" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("rp_id", TEST_RP_ID);
      expect(response.body).toHaveProperty("nonce");
      expect(response.body.nonce).toMatch(/^0x/);
      expect(response.body).toHaveProperty("signature");
      expect(response.body.signature).toMatch(/^0x/);
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("expires_at");
      expect(response.body.expires_at).toBeGreaterThan(response.body.created_at);
    });

    it("rejects request if action is missing", async () => {
      const response = await request(app).post("/api/world/rp-context").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("INVALID_REQUEST");
    });
  });

  describe("GET /api/events", () => {
    it("returns list of pre-seeded events", async () => {
      const response = await request(app).get("/api/events");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events.length).toBeGreaterThanOrEqual(2);
      expect(response.body.events[0]).toHaveProperty("id", "eth-denver-2027");
    });
  });

  describe("POST /api/claims/verify-and-claim", () => {
    const validProofPayload = (nullifier: string, action = "eth-denver-ticket-claim") => ({
      protocol_version: "4.0",
      nonce: "0x1234567890abcdef",
      action,
      responses: [
        {
          identifier: "proof_of_human",
          nullifier,
          proof: ["0x1", "0x2", "0x3", "0x4", "0x5"],
          issuer_schema_id: 1,
          expires_at_min: Math.floor(Date.now() / 1000) + 3600,
        },
      ],
    });

    it("successfully verifies proof and claims a ticket", async () => {
      const nullifier = "0xmock_human_alpha_001";
      const response = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x1111111111111111111111111111111111111111",
          proof_payload: validProofPayload(nullifier),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.claim.eventId).toBe("eth-denver-2027");
      expect(response.body.claim.walletAddress).toBe("0x1111111111111111111111111111111111111111");
    });

    it("rejects duplicate claim attempt for the same event by the same human", async () => {
      const nullifier = "0xmock_human_duplicate_test";

      // First claim succeeds
      const firstRes = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x1111111111111111111111111111111111111111",
          proof_payload: validProofPayload(nullifier),
        });
      expect(firstRes.status).toBe(201);

      // Second claim with identical nullifier for same event MUST be rejected
      const secondRes = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x2222222222222222222222222222222222222222",
          proof_payload: validProofPayload(nullifier),
        });

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.error).toBe("DUPLICATE_CLAIM");
      expect(secondRes.body.message).toContain("already claimed");
    });

    it("allows the same human to claim a ticket for a different event", async () => {
      const nullifier = "0xmock_human_multievent_test";

      // Claim for event 1 (ETH Denver)
      const res1 = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x1111111111111111111111111111111111111111",
          proof_payload: validProofPayload(nullifier, "eth-denver-ticket-claim"),
        });
      expect(res1.status).toBe(201);

      // Claim for event 2 (Devcon) with the same nullifier MUST succeed
      const res2 = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "devcon-2027",
          wallet_address: "0x1111111111111111111111111111111111111111",
          proof_payload: validProofPayload(nullifier, "devcon-ticket-claim"),
        });
      expect(res2.status).toBe(201);
      expect(res2.body.claim.eventId).toBe("devcon-2027");
    });

    it("rejects invalid proof payload", async () => {
      const invalidProof = {
        protocol_version: "4.0",
        nonce: "0x123",
        action: "eth-denver-ticket-claim",
        responses: [
          {
            identifier: "proof_of_human",
            nullifier: "0xmock_invalid_proof",
            proof: "invalid_proof",
          },
        ],
      };

      const response = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x1111111111111111111111111111111111111111",
          proof_payload: invalidProof,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("INVALID_PROOF");
    });

    it("rejects invalid EVM wallet address", async () => {
      const response = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "not-an-evm-address",
          proof_payload: validProofPayload("0xmock_human_1"),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("INVALID_WALLET_ADDRESS");
    });

    it("rejects claim for non-existent event", async () => {
      const response = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "non-existent-event-xyz",
          wallet_address: "0x1111111111111111111111111111111111111111",
          proof_payload: validProofPayload("0xmock_human_2"),
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("EVENT_NOT_FOUND");
    });

    it("safely handles concurrent claim requests for the same human and event", async () => {
      const nullifier = "0xmock_human_concurrent_race";

      // Execute 5 concurrent requests with the exact same nullifier
      const promises = Array.from({ length: 5 }).map((_, i) =>
        request(app)
          .post("/api/claims/verify-and-claim")
          .send({
            event_id: "eth-denver-2027",
            wallet_address: `0x${i.toString().repeat(40)}`,
            proof_payload: validProofPayload(nullifier),
          })
      );

      const results = await Promise.all(promises);
      const successfulClaims = results.filter((r) => r.status === 201);
      const duplicateRejections = results.filter((r) => r.status === 409);

      // Exactly ONE claim must succeed, and the other 4 must be rejected
      expect(successfulClaims.length).toBe(1);
      expect(duplicateRejections.length).toBe(4);
    });
  });
});

