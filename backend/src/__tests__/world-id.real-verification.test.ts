import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { getClaimRepository } from "../db/repository.js";
import { WorldIntegrationService, worldService } from "../integrations/world/world.service.js";

const VALID_TEST_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_RP_ID = "rp_fairdrop_test";

describe("World ID Real Verification & Security Requirements Suite", () => {
  beforeEach(async () => {
    const repo = getClaimRepository();
    if (repo.clearAllClaims) {
      await repo.clearAllClaims();
    }
    vi.restoreAllMocks();
  });

  describe("1. Real Mode vs Mock Proof Rejection", () => {
    it("16. Mock proof must be strictly rejected in real mode (WORLD_MOCK_VERIFICATION !== 'true')", async () => {
      // Create a service instance running in live mode (mock = false)
      const liveService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      // Temporarily ensure mock verification is disabled
      const origEnv = process.env.WORLD_MOCK_VERIFICATION;
      const origNodeEnv = process.env.NODE_ENV;
      process.env.WORLD_MOCK_VERIFICATION = "false";
      // Simulate non-test environment to test live mode rejection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = "production";

      try {
        const mockPayload = {
          protocol_version: "4.0",
          nonce: "0x123",
          action: "eth-denver-ticket-claim",
          responses: [
            {
              identifier: "proof_of_human",
              nullifier: "0xmock_human_12345",
              proof: ["0x1", "0x2"],
            },
          ],
        };

        const result = await liveService.verifyProof(mockPayload, "eth-denver-ticket-claim");
        expect(result.success).toBe(false);
        expect(result.error).toBe("MOCK_PROOF_REJECTED");
      } finally {
        process.env.WORLD_MOCK_VERIFICATION = origEnv;
        process.env.NODE_ENV = origNodeEnv;
      }
    });
  });

  describe("2. World Developer API v4 Backend Proof Validation", () => {
    it("1. Valid real World ID proof is accepted and authoritative nullifier is extracted from API v4", async () => {
      const realService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      // Mock fetch to simulate official developer.world.org/api/v4/verify/{rp_id} response
      const mockWorldApiResponse = {
        success: true,
        action: "eth-denver-ticket-claim",
        nullifier: "0x008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
        results: [
          {
            identifier: "orb",
            success: true,
            nullifier: "0x008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
          },
        ],
        environment: "staging",
      };

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockWorldApiResponse,
      } as Response);

      const payload = {
        protocol_version: "4.0",
        nonce: "0xabc",
        action: "eth-denver-ticket-claim",
        responses: [
          {
            identifier: "proof_of_human",
            nullifier: "0xclient_candidate_nullifier",
            proof: ["0x1", "0x2"],
          },
        ],
      };

      const result = await realService.verifyProof(payload, "eth-denver-ticket-claim");
      expect(result.success).toBe(true);
      // Authoritative nullifier must come from API v4, NOT the client payload
      expect(result.nullifier).toBe("0x008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v4/verify/${TEST_RP_ID}`),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("2. Invalid proof is rejected by World API v4", async () => {
      const realService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          code: "invalid_proof",
          detail: "The cryptographic proof could not be verified by the World sequencer.",
        }),
      } as Response);

      const payload = {
        protocol_version: "4.0",
        nonce: "0xabc",
        action: "eth-denver-ticket-claim",
        responses: [
          {
            identifier: "proof_of_human",
            nullifier: "0xsome_nullifier",
            proof: ["0xdeadbeef"],
          },
        ],
      };

      const result = await realService.verifyProof(payload, "eth-denver-ticket-claim");
      expect(result.success).toBe(false);
      expect(result.error).toBe("invalid_proof");
    });

    it("3. Missing proof responses is rejected immediately", async () => {
      const realService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await realService.verifyProof({
        protocol_version: "4.0",
        nonce: "0x123",
        action: "eth-denver-ticket-claim",
        responses: [],
      } as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe("MISSING_RESPONSES");
    });

    it("4. Malformed proof without candidate nullifier is rejected", async () => {
      const realService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await realService.verifyProof({
        protocol_version: "4.0",
        nonce: "0x123",
        action: "eth-denver-ticket-claim",
        responses: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { identifier: "proof_of_human", proof: ["0x1"] } as any,
        ],
      } as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe("MISSING_NULLIFIER");
    });

    it("9. Action mismatch is rejected before sending to World API", async () => {
      const realService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const payload = {
        protocol_version: "4.0",
        nonce: "0xabc",
        action: "malicious-different-event-action",
        responses: [
          {
            identifier: "proof_of_human",
            nullifier: "0x00112233",
            proof: ["0x1"],
          },
        ],
      };

      const result = await realService.verifyProof(payload, "eth-denver-ticket-claim");
      expect(result.success).toBe(false);
      expect(result.error).toBe("ACTION_MISMATCH");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("17. Network failure connecting to World API returns NETWORK_ERROR and fails closed", async () => {
      const realService = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Connection reset by peer"));

      const payload = {
        protocol_version: "4.0",
        nonce: "0xabc",
        action: "eth-denver-ticket-claim",
        responses: [
          {
            identifier: "proof_of_human",
            nullifier: "0x00112233",
            proof: ["0x1"],
          },
        ],
      };

      const result = await realService.verifyProof(payload, "eth-denver-ticket-claim");
      expect(result.success).toBe(false);
      expect(result.error).toBe("NETWORK_ERROR");
    });
  });

  describe("3. RP Context Generation & Security", () => {
    it("7 & 8. Generates valid cryptographic RP signature and nonce", async () => {
      const service = new WorldIntegrationService({
        rpId: TEST_RP_ID,
        signingKey: VALID_TEST_KEY,
      });

      const context = service.generateRpContext("eth-denver-ticket-claim", 300);
      expect(context.rp_id).toBe(TEST_RP_ID);
      expect(context.nonce).toMatch(/^0x[a-f0-9]{64}$/);
      expect(context.signature).toMatch(/^0x[a-f0-9]{130}$/);
      expect(context.expires_at - context.created_at).toBe(300);
    });

    it("11. Fails closed when World signing key is missing in production", () => {
      const origEnv = process.env.WORLD_MOCK_VERIFICATION;
      const origNodeEnv = process.env.NODE_ENV;
      process.env.WORLD_MOCK_VERIFICATION = "false";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = "production";

      try {
        const unconfiguredService = new WorldIntegrationService({
          rpId: TEST_RP_ID,
          signingKey: "",
        });

        expect(() => {
          unconfiguredService.generateRpContext("eth-denver-ticket-claim");
        }).toThrow(/Missing WORLD_SIGNING_KEY/);
      } finally {
        process.env.WORLD_MOCK_VERIFICATION = origEnv;
        process.env.NODE_ENV = origNodeEnv;
      }
    });

    it("rejects untrusted arbitrary actions in /api/world/rp-context route", async () => {
      const res = await request(app)
        .post("/api/world/rp-context")
        .send({ action: "unauthorized_arbitrary_action_attack" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("UNTRUSTED_ACTION");
    });
  });

  describe("4. End-to-End Claim Protection & Duplicate Prevention", () => {
    it("12. Duplicate human claim on same event is rejected with 409 Conflict", async () => {
      const testNullifier = "0xreal_human_nullifier_unique_001";

      vi.spyOn(worldService, "verifyProof").mockResolvedValue({
        success: true,
        nullifier: testNullifier,
        environment: "staging",
      });

      const payload = {
        protocol_version: "4.0",
        nonce: "0x123",
        action: "eth-denver-ticket-claim",
        responses: [{ identifier: "proof_of_human", nullifier: testNullifier, proof: ["0x1"] }],
      };

      // First claim succeeds
      const res1 = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x2222222222222222222222222222222222222222",
          proof_payload: payload,
        });

      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);

      // Second claim with SAME nullifier on SAME event must be rejected
      const res2 = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x2222222222222222222222222222222222222222",
          proof_payload: payload,
        });

      expect(res2.status).toBe(409);
      expect(res2.body.error).toBe("DUPLICATE_CLAIM");
    });

    it("13. Same human using ANOTHER wallet address is STILL rejected (anti-Sybil)", async () => {
      const testNullifier = "0xreal_human_nullifier_sybil_test";

      vi.spyOn(worldService, "verifyProof").mockResolvedValue({
        success: true,
        nullifier: testNullifier,
        environment: "staging",
      });

      const payload = {
        protocol_version: "4.0",
        nonce: "0x123",
        action: "eth-denver-ticket-claim",
        responses: [{ identifier: "proof_of_human", nullifier: testNullifier, proof: ["0x1"] }],
      };

      // Claim with Wallet A
      const resA = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          proof_payload: payload,
        });
      expect(resA.status).toBe(201);

      // Attempt claim with Wallet B by same human
      const resB = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          proof_payload: payload,
        });

      expect(resB.status).toBe(409);
      expect(resB.body.error).toBe("DUPLICATE_CLAIM");
    });

    it("14 & 15. Failed World verification must not create a ticket claim or Arkiv allocation", async () => {
      vi.spyOn(worldService, "verifyProof").mockResolvedValue({
        success: false,
        error: "INVALID_PROOF",
        detail: "Zero-knowledge proof verification failed on World developer sequencer.",
      });

      const payload = {
        protocol_version: "4.0",
        nonce: "0x123",
        action: "eth-denver-ticket-claim",
        responses: [{ identifier: "proof_of_human", nullifier: "0xfake", proof: ["0x0"] }],
      };

      const res = await request(app)
        .post("/api/claims/verify-and-claim")
        .send({
          event_id: "eth-denver-2027",
          wallet_address: "0x3333333333333333333333333333333333333333",
          proof_payload: payload,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_PROOF");

      // Verify no claim was stored in repository
      const repo = getClaimRepository();
      const eventClaims = await repo.getClaimsForEvent("eth-denver-2027");
      const found = eventClaims.some((c) => c.walletAddress.toLowerCase() === "0x3333333333333333333333333333333333333333");
      expect(found).toBe(false);
    });
  });
});
