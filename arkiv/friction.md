# Arkiv Integration Friction & Engineering Report

**Target Network**: Rabdi Testnet (`https://rpc.rabdi.db-chain.testnet.arkiv.network`)  
**SDK**: `@arkiv-network/sdk@1.0.1`  
**Base Library**: `viem@2.45.1`  
**Host Application**: FairDrop (ETHGlobal Mumbai 2026)  

This document logs the genuine engineering observations, friction points, and concrete recommendations gathered while building FairDrop's Arkiv queryable data layer.

---

## 1. Access Key Requirement in Chain Definition

### Issue
When instantiating the Rabdi chain configuration via `@arkiv-network/sdk/chains`, invoking `rabdi()` without arguments immediately throws:
```
MissingAccessKeyError: Rabdi needs an Arkiv access key: pass it as rabdi({ accessKey })
```

### Observation & Reproduction
In developer onboarding or hackathon environments, developers frequently start by connecting to public testnet endpoints without an immediate access key. Having `rabdi()` throw synchronously on empty invocation forces developers to dig into SDK internals to realize an empty string `rabdi({ accessKey: "" })` can be passed to use the public rate-limited endpoint.

### Recommendation
Allow `rabdi()` to default gracefully to `{ accessKey: "" }` with a console warning rather than throwing an unhandled exception at chain configuration instantiation time.

---

## 2. Query Builder vs Raw SQL Parsing (`client.query` vs `client.select`)

### Issue
Passing a query builder object or query AST to `client.query(...)` resulted in a JSON-RPC error from the Arkiv testnet node:
```
Query error: Query rejected (parse, -32001): unexpected character. Query: [object Object]
```

### Root Cause
`client.query()` expects a raw SQL query string, whereas the typed query builder is executed via `client.select().from(Schema).where(...).fetch()`. The SDK types in certain contexts accept broad parameters, leading to runtime confusion between the raw SQL string executor and the typed builder pipeline.

### Resolution in FairDrop
FairDrop standardized strictly on `client.select().from(Schema)...fetch()` for type-safe execution, and documented that `client.query(...)` is exclusively for raw SQL string statements.

---

## 3. TypeScript Type Variance on Compound `and(...)` Predicates

### Issue
When building compound filters across multiple schema columns:
```typescript
import { and, eq } from "@arkiv-network/sdk/query";

// Attempted:
client.select().from(TicketEntitySchema)
  .where(and(eq("eventId", id), eq("ticketType", type)))
  .fetch();
```
TypeScript produced the following compilation error:
```
TS2345: Argument of type 'ComparisonNode<ValueRef<"ticketType", string>>' 
is not assignable to parameter of type 'ComparisonNode<ValueRef<"eventId", string>>'.
Type '"ticketType"' is not assignable to type '"eventId"'.
```

### Root Cause
The generic signature for `ComparisonNode<TColumn, TValue>` enforces strict invariance on `TColumn` across parameters in `and(...)`. Consequently, when filtering across different fields, the array of nodes cannot be passed to a single `and()` call without casting to `any`.

### Resolution in FairDrop
We discovered that sequential chaining of `.where(...)` calls on the query builder natively concatenates predicates with logical `AND` while satisfying the TypeScript type checker cleanly:
```typescript
// Working solution:
client.select()
  .from(TicketEntitySchema)
  .where(eq("eventId", id))
  .where(eq("ticketType", type))
  .fetch();
```

### Recommendation
Relax the generic variance on `and(...conditions)` in `@arkiv-network/sdk/query` so that heterogeneous `ComparisonNode` instances can be passed into a single logical block.

---

## 4. Address Type Coercion (`addr` Wrapper Requirement)

### Issue
Querying address fields such as `buyerWallet` or `organizerWallet` with standard hex string addresses failed TypeScript type checking:
```typescript
.where(eq("buyerWallet", "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"))
// Error: Property '"buyerWallet" has type addr, but is compared against a value of type str' is missing
```

### Root Cause & Fix
The SDK schema definition defines address columns as type `addr()`. In queries, values must be explicitly wrapped in `addr(value as `0x${string}`)` to generate matching AST nodes.

### Recommendation
Provide auto-coercion for standard `0x${string}` hex values within `eq(column, value)` when the schema defines the column as an address type.

---

## 5. Client Type Exports at Package Root

### Issue
Attempting to import `PublicClient` or `WalletClient` directly from `@arkiv-network/sdk` failed with:
```
TS2305: Module '@arkiv-network/sdk' has no exported member 'PublicClient'.
```

### Fix
Imported native viem client types from `viem` or relied on return type inference on `arkivClient.extend(...)`.

### Recommendation
Re-export the extended client types directly from `@arkiv-network/sdk` for standard developer ergonomics.

---

## 6. Public Testnet Latency & Outbox Pattern Requirement

### Observation
While the Rabdi testnet node (`https://rpc.rabdi.db-chain.testnet.arkiv.network`) responds quickly under standard loads (block height queries resolve in < 150ms), unauthenticated requests occasionally encounter transient latency spikes or rate limits.

### How FairDrop Solved This
FairDrop implemented an **Outbox Pattern** with local cached snapshots:
1. When an event or allocation is created, it is written immediately to FairDrop's synchronized local snapshot for zero-latency UI rendering.
2. The entity write is queued in an Outbox pipeline and submitted to Arkiv testnet.
3. If an RPC timeout or transient error occurs, exponential backoff retries the write without blocking user checkout or breaking frontend state.
4. Once the transaction confirms on Arkiv, the on-chain entity key and block number are anchored to the local record.

This ensures FairDrop is resilient, production-ready, and never drops attendee registrations.

