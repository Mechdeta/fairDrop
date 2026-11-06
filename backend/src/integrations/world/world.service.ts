import { signRequest } from "@worldcoin/idkit-core/signing";
import type { RpContextResponse, VerifyProofResult, WorldIdVerifyRequestBody } from "./world.types.js";

export class WorldIntegrationService {
  private customRpId?: string;
  private customSigningKey?: string;

  constructor(options?: { rpId?: string; signingKey?: string }) {
    this.customRpId = options?.rpId;
    this.customSigningKey = options?.signingKey;
  }

  public get rpId(): string {
    return this.customRpId ?? process.env.WORLD_RP_ID ?? process.env.WORLD_APP_ID ?? "";
  }

  public get signingKey(): string {
    return (
      this.customSigningKey ??
      process.env.WORLD_SIGNING_KEY ??
      process.env.WORLD_RP_SIGNING_KEY ??
      process.env.RP_SIGNING_KEY ??
      ""
    );
  }

  public get environment(): "production" | "staging" | "sandbox" {
    return (process.env.WORLD_ENVIRONMENT as "production" | "staging" | "sandbox") ?? "staging";
  }

  public get isMockVerification(): boolean {
    return process.env.WORLD_MOCK_VERIFICATION === "true";
  }

  /**
   * Generates a Relying Party (RP) signature and context for the specified action.
   * This is computed securely on the backend using the secret signing key.
   * Never exposed to frontend clients.
   */
  public generateRpContext(action: string, ttlSeconds: number = 300): RpContextResponse {
    if (!action || typeof action !== "string") {
      throw new Error("Action string is required to generate RP context.");
    }

    const signingKey = this.signingKey;
    const rpId = this.rpId;

    if (!signingKey) {
      if (this.isMockVerification && process.env.NODE_ENV === "test") {
        // Return dummy deterministic context ONLY for isolated unit tests with mock enabled
        return {
          rp_id: rpId || "rp_mock_fairdrop",
          nonce: "0x0000000000000000000000000000000000000000000000000000000000000001",
          created_at: Math.floor(Date.now() / 1000),
          expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
          signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        };
      }
      throw new Error(
        "Missing WORLD_SIGNING_KEY in server environment. Configure it in backend/.env."
      );
    }

    if (!rpId) {
      throw new Error("Missing WORLD_RP_ID in server environment. Configure it in backend/.env.");
    }

    const signResult = signRequest({
      signingKeyHex: signingKey,
      action,
      ttl: ttlSeconds,
    });

    console.log(
      `[WorldService] Generated valid RP context for action '${action}' (RP ID: ${rpId}, expires in ${ttlSeconds}s)`
    );

    return {
      rp_id: rpId,
      nonce: signResult.nonce,
      created_at: signResult.createdAt,
      expires_at: signResult.expiresAt,
      signature: signResult.sig,
    };
  }

  /**
   * Verifies the World ID proof against World's official v4 verification endpoint.
   * Never trusts client-side verification flags.
   */
  public async verifyProof(
    proofPayload: WorldIdVerifyRequestBody,
    expectedAction?: string
  ): Promise<VerifyProofResult> {
    if (!proofPayload || typeof proofPayload !== "object") {
      return { success: false, error: "INVALID_PAYLOAD", detail: "Proof payload is required." };
    }

    if (!Array.isArray(proofPayload.responses) || proofPayload.responses.length === 0) {
      return {
        success: false,
        error: "MISSING_RESPONSES",
        detail: "Proof payload must include at least one credential response.",
      };
    }

    if (expectedAction && proofPayload.action && proofPayload.action !== expectedAction) {
      return {
        success: false,
        error: "ACTION_MISMATCH",
        detail: `Proof action '${proofPayload.action}' does not match expected action '${expectedAction}'.`,
      };
    }

    // Extract candidate nullifier from primary response
    const primaryResponse = proofPayload.responses[0];
    const extractedNullifier = primaryResponse?.nullifier;

    if (!extractedNullifier) {
      return {
        success: false,
        error: "MISSING_NULLIFIER",
        detail: "Response item must contain a verified nullifier.",
      };
    }

    const isExplicitMockProof =
      extractedNullifier.startsWith("0xmock_") || extractedNullifier.startsWith("0xsim_");

    // Real Mode: Reject any mock or simulated nullifiers
    if (!this.isMockVerification && isExplicitMockProof) {
      console.warn(`[WorldService] Rejected mock proof nullifier in live verification mode.`);
      return {
        success: false,
        error: "MOCK_PROOF_REJECTED",
        detail: "Mock proofs are not accepted in live verification mode. Please verify using World App.",
      };
    }

    // Isolated Unit Test Mode: ONLY when WORLD_MOCK_VERIFICATION=true AND running in test environment
    if (this.isMockVerification && process.env.NODE_ENV === "test") {
      if (extractedNullifier.includes("invalid") || primaryResponse.proof === "invalid_proof") {
        return {
          success: false,
          error: "INVALID_PROOF",
          detail: "Simulated verification detected an invalid proof flag.",
        };
      }

      return {
        success: true,
        nullifier: extractedNullifier,
        environment: "simulated-environment",
      };
    }

    // Live Authoritative verification against official World Developer API v4
    const rpIdToVerify = this.rpId;
    if (!rpIdToVerify) {
      return {
        success: false,
        error: "CONFIGURATION_ERROR",
        detail: "WORLD_RP_ID is not configured on the backend.",
      };
    }

    const baseUrl = process.env.WORLD_VERIFY_BASE_URL ?? "https://developer.world.org";
    const verifyEndpoint = `${baseUrl}/api/v4/verify/${rpIdToVerify}`;

    try {
      console.log(`[WorldService] Verifying proof against ${verifyEndpoint} (action: ${expectedAction || proofPayload.action})`);
      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FairDrop-Backend/1.0",
        },
        body: JSON.stringify(proofPayload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        nullifier?: string;
        code?: string;
        detail?: string;
        message?: string;
        results?: Array<{ identifier?: string; success?: boolean; nullifier?: string; code?: string; detail?: string }>;
      };

      console.log(`[WorldService] Verification API response status: ${response.status}, success: ${data.success}`);

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.code ?? "VERIFICATION_FAILED",
          detail: data.detail ?? data.message ?? `World API responded with status ${response.status}`,
        };
      }

      // Authoritative nullifier extracted directly from World API v4 response
      const verifiedNullifier =
        data.nullifier ??
        data.results?.[0]?.nullifier;

      if (!verifiedNullifier) {
        return {
          success: false,
          error: "NULLIFIER_MISSING",
          detail: "World verification succeeded but no authoritative nullifier was returned by the official API.",
        };
      }

      return {
        success: true,
        nullifier: verifiedNullifier,
        environment: this.environment,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error connecting to World API.";
      console.error(`[WorldService] Network error during proof verification: ${message}`);
      return {
        success: false,
        error: "NETWORK_ERROR",
        detail: `Failed to connect to World verification API: ${message}`,
      };
    }
  }
}

export const worldService = new WorldIntegrationService();
