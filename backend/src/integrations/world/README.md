# World ID 4.0 Backend Integration

This module implements server-side World ID 4.0 verification and RP signature generation for FairDrop.

## How it works

1. **Relying Party (RP) Context Generation (`/api/world/rp-context`)**:
   - Computes an EIP-191 ECDSA signature using `@worldcoin/idkit-core/signing` and the secret `WORLD_RP_SIGNING_KEY`.
   - Incorporates a secure 32-byte nonce, timestamps (`created_at`, `expires_at`), and the target event `action`.
   - Protects against frontend request impersonation and replay attacks.
   - The private signing key **never leaves the server**.

2. **Server-Side Proof Verification (`/api/claims/verify-and-claim`)**:
   - Takes the IDKit verification result payload from the client.
   - Validates event ID and EVM wallet address format.
   - Forwards proof payload to World Developer API v4:
     `POST https://developer.world.org/api/v4/verify/{rp_id}` (or staging).
   - Validates `data.success === true` and extracts the RP-scoped `nullifier`.
   - Rejects invalid proofs immediately with `400 Bad Request`.

3. **Event-Scoped Uniqueness Enforcement**:
   - Executes an atomic database insertion with unique constraint `(event_id, world_nullifier_hash)`.
   - If a duplicate claim attempt occurs, it is blocked and returns `409 Conflict`.
   - A single human (`nullifier`) can claim tickets for multiple different events, but only once per event.
