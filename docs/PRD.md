# FairDrop — Phase 1 implementation brief

This is the implementation brief for the first development milestone. The team's source of product requirements is **FairDrop PRD v1.0**.

## Product
FairDrop is a Web3 event-ticketing marketplace designed to make limited-ticket distribution fairer through unique-human verification, transparent allocation, contract-enforced ownership, and controlled resale.

## Agreed build order
1. **World first:** verification and event-scoped duplicate-claim prevention.
2. **Arkiv later:** decentralized, queryable event and marketplace records.
3. **Arc later:** USDC payment and settlement.

Only Phase 1 is active in this repository. Arkiv and Arc are not implemented in this scaffold.

## Phase 1 scope
- Attendee opens an event and connects a supported EVM wallet.
- Attendee starts World ID verification through the official integration.
- Backend verifies the submitted proof.
- The event-scoped uniqueness value from the verified proof prevents a second claim for the same event.
- UI shows verification and registration success, duplicate-claim, or failure states.

Event details may initially be seeded for the demo. Avoid a complex organizer workflow unless Phase 1 needs it.

## Acceptance criteria
- Proof is verified by the backend, not accepted only because the frontend reports success.
- A verified participant can register once per event.
- A repeated claim for the same event is rejected.
- Claim checking and insertion are atomic, protected by a unique constraint on `(event_id, world_nullifier_hash)`.
- Invalid proofs cannot create claims.
- UI communicates verification and claim states clearly.
- No private keys or unnecessary identity data are stored.

## Architecture boundaries
- **Frontend:** event/claim screens and World verification UI.
- **Backend:** proof verification, claim rules, and API responses.
- **PostgreSQL:** operational users, events, claims, and uniqueness constraint.
- **World ID:** privacy-preserving unique-human proof.

Use the current official World developer docs for the exact SDK, request shape, proof fields, and verification configuration. FairDrop REST endpoint names in the source PRD are proposed application endpoints, not partner-provided APIs.

## Deferred
Lottery allocation, Arkiv writes/queries, Arc USDC payments, smart-contract ticket issuance, resale, and venue check-in are later milestones. Do not block the initial World demo on them.
