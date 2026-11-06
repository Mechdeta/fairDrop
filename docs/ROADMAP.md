# Development roadmap

## Phase 1 — World-first working demo (active)
1. Run frontend and backend locally.
2. Define event and claim data models.
3. Implement the official World ID client flow.
4. Verify proofs on the backend.
5. Enforce one claim per verified human per event with an atomic database operation.
6. Demonstrate one successful claim and a rejected duplicate claim.

**Exit condition:** teammates can run the project, complete World verification in the supported environment, and show that a second claim for the same event is rejected.

## Phase 2 — Arkiv (deferred)
Add event/allocation/ticket marketplace records and at least one user-facing read backed by Arkiv. Keep record synchronization separate from operational ownership state.

## Phase 3 — Arc (deferred)
Add USDC purchase and settlement on the required Arc testnet, then contract-enforced ticket ownership and controlled resale.

## Final integration and submission
Test failure/retry paths, reconcile displayed state against authoritative sources, document partner evidence, and prepare demo/submission materials.
