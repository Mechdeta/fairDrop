# FairDrop Ecosystem Reach & Value Proposition

FairDrop uses **Arkiv DB-Chain** as a public, verifiable, queryable Web3 data layer for event ticket listings, inventory availability, and allocation receipts. This document outlines the practical value delivered to organizers, attendees, and the broader decentralized application ecosystem.

---

## 1. Who Benefits from Arkiv-Backed Ticket Listings?

Traditional ticketing platforms (e.g., Ticketmaster, Eventbrite) lock event discovery and ticket inventory behind proprietary databases. This siloed model creates:
- Lack of inventory transparency (hidden ticket reserves, deceptive pricing).
- Walled gardens that block third-party discovery apps and calendar aggregators.
- Centralized points of failure where server outages completely halt ticket sales.

By publishing public event entities and ticket availability on Arkiv's decentralized database chain:
1. **Event Organizers** gain censorship-resistant, decentralized distribution without managing expensive server clusters.
2. **Attendees** gain cryptographic certainty that ticket listings and remaining counts are genuine and unmodified.
3. **Third-Party Ecosystem Developers** can build decentralized event search engines, Web3 calendar aggregators, and community dashboards without asking FairDrop for API keys or custom database integrations.

---

## 2. Why Event Organizers Use FairDrop on Arkiv

- **Decentralized Distribution**: Organizers retain cryptographic ownership of their event entities (`fairdrop.event.v1`) on Arkiv. They can sign updates directly from their organizer wallet without fear of platform lock-in.
- **Bot and Sybil Resistance**: Combined with FairDrop's World ID 4.0 Proof of Humanity, organizers ensure that each ticket allocation goes to a distinct, unique human, preventing scalper bots from hoarding inventory.
- **Universal Composability**: Because listings are published to the open Rabdi testnet (Chain ID `7794095`), any external dapp or community portal can verify an organizer's active listings.
- **Low Operational Overhead**: Organizers do not need to host or maintain complex database clusters; Arkiv handles structured queries and decentralized persistence natively.

---

## 3. Why Attendees Benefit

- **Verified Authenticity**: Attendees can inspect the `EventEntity` directly on the [Arkiv Block Explorer](https://rabdi.explorer.arkiv.network) to verify ticket pricing, total supply, and organizer identity.
- **Real-Time Inventory Truth**: Remaining ticket counts (`availableTicketCount`) are publicly visible and verifiable on-chain, preventing artificial scarcity tactics.
- **Pseudonymous Ownership**: Once an allocation succeeds, attendees receive an on-chain receipt (`fairdrop.allocation.v1`) linking their EVM wallet address to the ticket ID without exposing sensitive private details, names, or email addresses.

---

## 4. How Third-Party Applications Query FairDrop Listings

Because Arkiv is open and queryable via SQL and typed SDKs, any external developer can query FairDrop's listings using `@arkiv-network/sdk`:

### Example: External Event Discovery App Querying Active Hackathons in Mumbai
```typescript
import { createPublicClient, http } from "viem";
import { arkiv } from "@arkiv-network/sdk";
import { rabdi } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";
import { EventEntitySchema } from "./schemas";

const client = createPublicClient({
  chain: rabdi({ accessKey: process.env.ARKIV_ACCESS_KEY || "" }),
  transport: http("https://rpc.rabdi.db-chain.testnet.arkiv.network"),
}).extend(arkiv());

// Query all active events in Mumbai
const mumbaiEvents = await client
  .select()
  .from(EventEntitySchema)
  .where(eq("city", "Mumbai"))
  .where(eq("eventStatus", "active"))
  .fetch();

console.log("Found FairDrop events in Mumbai:", mumbaiEvents);
```

Third parties do not need FairDrop backend credentials; they simply connect to the Arkiv RPC and query the public `fairdrop.event.v1` schema directly.

---

## 5. Post-Hackathon Availability

- **Testnet Continuity**: The Rabdi testnet deployment will remain active, queryable, and maintained post-ETHGlobal Mumbai 2026.
- **Roadmap to Arkiv Mainnet**: FairDrop is slated to deploy canonical schemas to Arkiv Mainnet upon public network release, serving as a flagship demonstration of bot-proof decentralized ticketing powered by World ID, Arc USDC settlement, and Arkiv DB-Chain.

