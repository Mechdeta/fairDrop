# FairDrop — The Bot-Proof Web3 Ticket Marketplace

> Built for **ETHGlobal Mumbai 2026**  
> Powered by **Arkiv DB-Chain**, **World ID 4.0**, and **Arc USDC Protocol**

FairDrop is a decentralized, bot-proof event ticketing protocol designed to prevent Sybil attacks, scalpers, and duplicate ticket claims. By combining zero-knowledge Proof of Humanity (World ID 4.0), decentralized database indexing (Arkiv DB-Chain), and native stablecoin settlement (Arc USDC), FairDrop guarantees transparent, verifiable, one-ticket-per-human event distribution.

---

## 🏛️ Arkiv DB-Chain Integration (Rabdi Testnet)

Arkiv is not merely a transaction log in FairDrop—it serves as the **active, queryable Web3 data layer** powering public event discovery, ticket tier listings, remaining inventory counts, and public allocation receipts.

### 🌐 Network Details

- **Network Name**: Arkiv Rabdi Testnet
- **Chain ID**: `7794095`
- **RPC Endpoint**: `https://rpc.rabdi.db-chain.testnet.arkiv.network`
- **Indexer URL**: `https://indexer.rabdi.db-chain.testnet.arkiv.network`
- **Block Explorer**: [https://rabdi.explorer.arkiv.network](https://rabdi.explorer.arkiv.network)
- **Faucet**: [https://hub.arkiv.network/faucet](https://hub.arkiv.network/faucet)
- **Access Keys**: [https://hub.arkiv.network/access-keys](https://hub.arkiv.network/access-keys)
- **SDK**: `@arkiv-network/sdk@1.0.1` + `viem@2.45.1`

---

## 📊 Data Architecture: Arkiv vs. MongoDB

FairDrop enforces a strict hybrid data boundary:

| Layer | Technology | Stored Data | Access Model |
| :--- | :--- | :--- | :--- |
| **Public Web3 Data Layer** | **Arkiv DB-Chain** | • Event listings (`fairdrop.event.v1`)<br>• Ticket tiers & pricing (`fairdrop.ticket.v1`)<br>• Public remaining inventory<br>• Pseudonymous allocation receipts (`fairdrop.allocation.v1`)<br>• Event metadata (city, category, venue, dates) | **Publicly Queryable** via typed Arkiv SDK or SQL queries without API keys. |
| **Private Operational State** | **MongoDB / Memory** | • World ID nullifier hash registry (duplicate claim check)<br>• Ephemeral reservation concurrency locks (5-minute checkout window)<br>• Attendee session state<br>• Private signing keys & payment webhooks | **Private & Internal** to protect user zero-knowledge privacy and handle high-speed checkout locks. |

---

## 🔍 Real Arkiv Query Judges Can Run

Any developer or hackathon judge can query FairDrop's public event listings directly from Rabdi testnet without requiring credentials or backend access:

### Option A: Using the `@arkiv-network/sdk` in Node.js / TypeScript
```typescript
import { createPublicClient, http } from "viem";
import { arkiv, schema, text, numeric, integer, address } from "@arkiv-network/sdk";
import { rabdi } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";

// 1. Initialize Viem client extended with Arkiv SDK
const client = createPublicClient({
  chain: rabdi({ accessKey: "" }), // Public testnet tier
  transport: http("https://rpc.rabdi.db-chain.testnet.arkiv.network"),
}).extend(arkiv());

// 2. Define FairDrop Event Schema
const EventSchema = schema("fairdrop.event.v1", {
  eventId: text().indexed(),
  organizerWallet: address().indexed(),
  eventName: text().indexed(),
  category: text().indexed(),
  city: text().indexed(),
  startTime: integer().indexed(),
  ticketPrice: numeric(),
  availableTicketCount: integer(),
  eventStatus: text().indexed(),
});

// 3. Query Active Hackathon Events in Mumbai
const events = await client
  .select()
  .from(EventSchema)
  .where(eq("city", "Mumbai"))
  .where(eq("eventStatus", "active"))
  .fetch();

console.log("Queried Events from Arkiv Rabdi Testnet:", events);
```

### Option B: Query FairDrop's Live Backend Arkiv Gateway
```bash
# Get live Rabdi testnet block height and status
curl https://localhost:4000/api/arkiv/status

# Query all events indexed from Arkiv
curl https://localhost:4000/api/arkiv/events

# Query events by category from Arkiv
curl https://localhost:4000/api/arkiv/events?category=Hackathon

# Query ticket tiers for an event from Arkiv
curl https://localhost:4000/api/arkiv/events/eth-mumbai-2026/tickets
```

---

## 📁 Arkiv Documentation Index

For in-depth architectural details, review the dedicated reports under `/arkiv/`:
- [`arkiv/schema.md`](./arkiv/schema.md): Complete typed schemas (`fairdrop.event.v1`, `fairdrop.ticket.v1`, `fairdrop.allocation.v1`), indexed columns, ownership, and 90-day TTL.
- [`arkiv/friction.md`](./arkiv/friction.md): Real engineering observations, SDK ergonomics feedback, TypeScript type variance resolutions, and testnet learnings.
- [`arkiv/reach.md`](./arkiv/reach.md): Ecosystem reach, organizer autonomy, attendee verification guarantees, and third-party query composability.
- [`arkiv/why-arkiv.md`](./arkiv/why-arkiv.md): Detailed architectural rationale for why Arkiv replaces centralized ticketing databases while keeping sensitive state in private storage.
- [`arkiv/how-you-use-arkiv.md`](./arkiv/how-you-use-arkiv.md): Feature-by-feature breakdown of frontend reads and backend writes across FairDrop.

---

## 🚀 Quickstart & Demo Reproduction

### 1. Clone Repository
```bash
git clone https://github.com/Mechdeta/fairDrop.git
cd fairDrop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Ensure `backend/.env` contains the Arkiv Rabdi Testnet configuration:
```env
# Arkiv DB-Chain Integration (Rabdi Testnet)
ARKIV_RPC_URL=https://rpc.rabdi.db-chain.testnet.arkiv.network
ARKIV_INDEXER_URL=https://indexer.rabdi.db-chain.testnet.arkiv.network
ARKIV_CHAIN_ID=7794095
ARKIV_ACCESS_KEY=
```

### 4. Run Automated Test Suite
Run the 52 automated tests covering event creation, ticket listing, category/city queries, inventory decrementing, and outbox retries:
```bash
npm test
```

### 5. Launch Development Servers
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

### 6. Interactive Demo Steps
1. Navigate to `http://localhost:3000`.
2. Notice the **Rabdi Testnet • Chain ID 7794095** live badge in the event discovery section.
3. Filter events by category (`Conference`, `Hackathon`, `Festival`) to see Arkiv queries in action.
4. Click on an event (e.g., **ETHGlobal Mumbai 2026**) to open the modal.
5. Inspect the live Arkiv entity key (`0xarkiv_...`), verified ticket tiers, and click **"Audit Event Entity on Arkiv Explorer"**.
6. Connect a genuine Web3 wallet (MetaMask, Coinbase Wallet, Rainbow).
7. Verify humanity with World ID.
8. Reserve and complete ticket claim; observe real-time inventory decrement and allocation receipt generation on Arkiv!

---

## 🛠️ Verification & Quality Checks

Run all verification commands:
```bash
# Typecheck frontend and backend
npm run typecheck

# Execute backend tests (52/52 passing)
npm run test

# Production build frontend and backend
npm run build
```

---

## 📜 License & Disclosures

- **License**: MIT Open Source License ([LICENSE](./LICENSE)).
- **AI Usage**: All AI assistance, engineering prompts, and human verification steps are transparently disclosed in [`docs/AI_USAGE.md`](./docs/AI_USAGE.md) in compliance with ETHGlobal hackathon rules.
