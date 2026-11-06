# World ID 4.0 Frontend Integration

This module handles client-side Proof of Human verification using the official `@worldcoin/idkit` React SDK.

## Flow & Architecture

1. **Attendee Preparation**:
   - Attendee connects their EVM wallet (MetaMask or custom/demo address).
   - Selects an event to claim tickets for.

2. **RP Context Acquisition**:
   - The frontend requests an RP context from `POST /api/world/rp-context`.
   - The backend signs the action with its secret `WORLD_RP_SIGNING_KEY` and returns:
     `{ rp_id, nonce, created_at, expires_at, signature }`.

3. **World ID 4.0 Widget (`IDKitRequestWidget`)**:
   - Opens the modal using `preset={proofOfHuman()}` and `rp_context`.
   - In World App (or Simulator), the attendee confirms Proof of Personhood.
   - IDKit returns the zero-knowledge proof payload (`IDKitResult`).

4. **Authoritative Backend Submission**:
   - The frontend forwards `{ event_id, wallet_address, proof_payload }` to `POST /api/claims/verify-and-claim`.
   - Backend performs cryptographic verification and atomic database insertion.
   - Frontend displays confirmation or duplicate-claim rejection feedback.

## Developer Simulator
For local development, hackathons, and offline testing, the UI includes simulator buttons ("Simulate New Human" and "Simulate Duplicate Test") allowing teammates to test the complete end-to-end duplicate-claim rejection rules in 1 click.
