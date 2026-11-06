# World ID backend integration

Reserved location for server-side World proof verification.

Requirements from FairDrop PRD v1.0:
- Use the current official World verification flow.
- Verify submitted proof data on the backend.
- Use the event-scoped uniqueness value supported by the official integration.
- Reject invalid proofs.
- Enforce one claim per event with an atomic database operation and a unique constraint on `(event_id, world_nullifier_hash)`.
- Do not store private keys or unnecessary identity data.

Confirm exact SDK methods, request fields, proof fields, and verification configuration from current official World docs before coding. Never trust a frontend-only success flag.
