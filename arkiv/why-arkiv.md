# Why Arkiv? Architectural Rationale & Data Separation

FairDrop implements a deliberate **hybrid architecture** that combines **Arkiv DB-Chain** for public, verifiable Web3 data and **MongoDB** for private, operational, and transactional state.

---

## 1. Why Store Public Ticket Listings on Arkiv?

In a Web3 ticketing ecosystem, the core value proposition is **trust, fairness, and composability**:
- **Verifiable Truth**: When an organizer posts that 500 tickets are available at 25 USDC, attendees should not have to trust a centralized backend server. Arkiv provides cryptographic guarantees that event listings and ticket terms cannot be silently altered or revoked without an organizer-signed on-chain transaction.
- **Wallet-Owned Entities**: Organizers own their listings through their EVM wallet address (`organizerWallet`). This decouples event creators from platform gatekeepers. If FairDrop frontend were ever offline, an organizer's listings and allocations remain intact and queryable on the Rabdi network.
- **Composability**: In Web2, sharing inventory across ticket aggregators requires cumbersome OAuth setups, API rate limits, and custom partner agreements. With Arkiv, any dapp, wallet, or calendar aggregator can run structured SQL queries directly against the open database chain.

---

## 2. Why MongoDB Alone Is Insufficient

If FairDrop relied exclusively on MongoDB:
1. **Centralized Trust Barrier**: Attendees would have no independent means to verify ticket availability, prices, or allocation integrity.
2. **Walled Garden**: Third-party developers could not independently build on FairDrop event data without centralized API keys, database credentials, and approval.
3. **No Web3 Ownership**: Event entities would be rows in a private cloud database owned by a single company, rather than decentralized digital assets owned by the organizer's cryptographic keys.

---

## 3. Why Private Application State Remains in MongoDB

While Arkiv is ideal for public data, storing **all** state on-chain is neither secure nor architecturally sound:

```
┌────────────────────────────────────────────────────────┐
│                      FAIRDROP DATA                     │
├───────────────────────────┬────────────────────────────┤
│   ARKIV DB-CHAIN          │   MONGODB / PRIVATE DB     │
│   (Public & Queryable)    │   (Private & Operational)  │
├───────────────────────────┼────────────────────────────┤
│ • Event Listings          │ • World ID Nullifier Hashes│
│ • Ticket Tiers & Prices   │ • Ephemeral Reservation    │
│ • Public Availability     │   Locks (5-min checkout)   │
│ • Pseudonymous Allocation │ • Attendee Session Profiles│
│   Receipts (wallet + tx)  │ • Arc Payment Webhooks &   │
│ • Public Metadata (venue, │   Internal Outbox Retries  │
│   city, time)             │ • Organizer API Secrets    │
└───────────────────────────┴────────────────────────────┘
```

### Specific Reasons for Keeping Private Data off Arkiv:
1. **Zero-Knowledge Privacy (World ID Proofs & Nullifiers)**:
   - While World ID proofs are zero-knowledge, publishing raw nullifiers and proof vectors directly to a public, permanent database could facilitate cross-app correlation or deanonymization of user activity over time.
   - FairDrop enforces duplicate claim prevention internally within the verification service to protect user privacy.
2. **Microsecond Reservation Locks**:
   - During high-demand ticket drops, thousands of users may click "Reserve" concurrently. Locking a ticket inventory slot for a 5-minute checkout window requires millisecond ACID locks (in-memory / MongoDB transactions).
   - Arkiv is updated once the checkout completes and payment confirms, keeping the on-chain data clean, definitive, and unpolluted by abandoned cart reservations.
3. **Security & Key Management**:
   - Backend signing keys, webhook secrets, and private operational logs must never touch a public blockchain.

---

## 4. Summary

Arkiv transforms FairDrop from a standard Web2 ticketing app with crypto payments into a **genuinely decentralized, composable event protocol**, while MongoDB handles high-speed transactional coordination and user privacy protection.

