import pg from "pg";
import { type Claim, DuplicateClaimError, type Event, type IClaimRepository } from "./types.js";

const DEFAULT_EVENTS: Event[] = [
  {
    id: "eth-denver-2027",
    name: "ETHDenver 2027 Main Stage Pass",
    description: "Exclusive access to the largest Web3 #BUIDLathon and developer summit.",
    date: "February 26 – March 1, 2027",
    location: "National Western Complex, Denver, CO",
    actionId: "eth-denver-ticket-claim",
    totalTickets: 250,
    claimedTickets: 0,
  },
  {
    id: "devcon-2027",
    name: "Devcon VIII Global Builder Pass",
    description: "The premier Ethereum gathering for developers, researchers, and creators.",
    date: "October 14 – 17, 2027",
    location: "Convention Center, Tokyo, Japan",
    actionId: "devcon-ticket-claim",
    totalTickets: 150,
    claimedTickets: 0,
  },
];

export class InMemoryClaimRepository implements IClaimRepository {
  private events: Map<string, Event> = new Map();
  private claims: Claim[] = [];
  private nullifierEventSet: Set<string> = new Set();

  constructor() {
    for (const ev of DEFAULT_EVENTS) {
      this.events.set(ev.id, { ...ev });
    }
  }

  public async init(): Promise<void> {
    // In-memory initialization is immediate
  }

  public async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  public async getEventById(id: string): Promise<Event | null> {
    return this.events.get(id) ?? null;
  }

  public async getClaimsForEvent(eventId: string): Promise<Claim[]> {
    return this.claims.filter((c) => c.eventId === eventId);
  }

  public async createClaim(
    eventId: string,
    walletAddress: string,
    nullifierHash: string
  ): Promise<Claim> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event '${eventId}' not found.`);
    }

    const uniqueKey = `${eventId}:${nullifierHash}`;

    // Atomic uniqueness check enforcing (event_id, world_nullifier_hash)
    if (this.nullifierEventSet.has(uniqueKey)) {
      throw new DuplicateClaimError(eventId, nullifierHash);
    }

    this.nullifierEventSet.add(uniqueKey);

    const claim: Claim = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      eventId,
      walletAddress,
      worldNullifierHash: nullifierHash,
      claimedAt: new Date().toISOString(),
    };

    this.claims.push(claim);
    event.claimedTickets += 1;

    return claim;
  }

  public async clearAllClaims(): Promise<void> {
    this.claims = [];
    this.nullifierEventSet.clear();
    for (const ev of this.events.values()) {
      ev.claimedTickets = 0;
    }
  }
}

export class PostgresClaimRepository implements IClaimRepository {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  public async init(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          date VARCHAR(64) NOT NULL,
          location VARCHAR(255) NOT NULL,
          action_id VARCHAR(128) NOT NULL,
          total_tickets INT NOT NULL,
          claimed_tickets INT NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS claims (
          id SERIAL PRIMARY KEY,
          event_id VARCHAR(64) NOT NULL REFERENCES events(id),
          wallet_address VARCHAR(42) NOT NULL,
          world_nullifier_hash VARCHAR(128) NOT NULL,
          claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT uq_event_nullifier UNIQUE (event_id, world_nullifier_hash)
        );
      `);

      // Seed default events if empty
      const existingEvents = await client.query("SELECT COUNT(*) FROM events");
      if (Number(existingEvents.rows[0].count) === 0) {
        for (const ev of DEFAULT_EVENTS) {
          await client.query(
            `INSERT INTO events (id, name, description, date, location, action_id, total_tickets, claimed_tickets)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING;`,
            [ev.id, ev.name, ev.description, ev.date, ev.location, ev.actionId, ev.totalTickets, ev.claimedTickets]
          );
        }
      }
    } finally {
      client.release();
    }
  }

  public async getEvents(): Promise<Event[]> {
    const result = await this.pool.query(
      "SELECT id, name, description, date, location, action_id AS \"actionId\", total_tickets AS \"totalTickets\", claimed_tickets AS \"claimedTickets\" FROM events"
    );
    return result.rows;
  }

  public async getEventById(id: string): Promise<Event | null> {
    const result = await this.pool.query(
      "SELECT id, name, description, date, location, action_id AS \"actionId\", total_tickets AS \"totalTickets\", claimed_tickets AS \"claimedTickets\" FROM events WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  }

  public async getClaimsForEvent(eventId: string): Promise<Claim[]> {
    const result = await this.pool.query(
      "SELECT id::text, event_id AS \"eventId\", wallet_address AS \"walletAddress\", world_nullifier_hash AS \"worldNullifierHash\", claimed_at AS \"claimedAt\" FROM claims WHERE event_id = $1",
      [eventId]
    );
    return result.rows;
  }

  public async createClaim(
    eventId: string,
    walletAddress: string,
    nullifierHash: string
  ): Promise<Claim> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Verify event exists
      const eventRes = await client.query("SELECT id FROM events WHERE id = $1 FOR UPDATE", [eventId]);
      if (eventRes.rowCount === 0) {
        throw new Error(`Event '${eventId}' not found.`);
      }

      // Atomic insert governed by UNIQUE constraint
      const insertRes = await client.query(
        `INSERT INTO claims (event_id, wallet_address, world_nullifier_hash)
         VALUES ($1, $2, $3)
         RETURNING id::text, event_id AS "eventId", wallet_address AS "walletAddress", world_nullifier_hash AS "worldNullifierHash", claimed_at AS "claimedAt"`,
        [eventId, walletAddress, nullifierHash]
      );

      // Increment claimed_tickets
      await client.query("UPDATE events SET claimed_tickets = claimed_tickets + 1 WHERE id = $1", [eventId]);

      await client.query("COMMIT");
      return insertRes.rows[0];
    } catch (err: unknown) {
      await client.query("ROLLBACK");
      // Postgres error code 23505 is unique_violation
      if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505") {
        throw new DuplicateClaimError(eventId, nullifierHash);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  public async clearAllClaims(): Promise<void> {
    await this.pool.query("DELETE FROM claims");
    await this.pool.query("UPDATE events SET claimed_tickets = 0");
  }
}

let repositoryInstance: IClaimRepository | null = null;

export function getClaimRepository(): IClaimRepository {
  if (!repositoryInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      repositoryInstance = new PostgresClaimRepository(databaseUrl);
    } else {
      repositoryInstance = new InMemoryClaimRepository();
    }
  }
  return repositoryInstance;
}

