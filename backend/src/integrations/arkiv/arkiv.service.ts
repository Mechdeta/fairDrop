import crypto from "crypto";
import type {
  ArkivAllocationPayload,
  ArkivEntity,
  ArkivNetworkStatus,
  ArkivQueryFilter,
  ArkivResalePayload,
} from "./arkiv.types.js";

export class ArkivIntegrationService {
  private entities: Map<string, ArkivEntity> = new Map();
  private currentBlockHeight: number = 1842091;
  private readonly organizerWallet: string = "0xFairDropProtocolDeployer0000000000000001";

  constructor() {
    this.seedDefaultArkivEntities();
  }

  public get rpcUrl(): string {
    return process.env.ARKIV_RPC_URL ?? "https://rpc.arkiv.network/v1";
  }

  public get dbChainId(): string {
    return process.env.ARKIV_DB_CHAIN_ID ?? "arkiv-eth-sepolia-01";
  }

  public get isLiveNetworkConfigured(): boolean {
    return Boolean(process.env.ARKIV_RPC_URL && process.env.ARKIV_PRIVATE_KEY);
  }

  /**
   * Generates a deterministic Merkle-style root hash for an entity payload.
   */
  private computeEntityHash(payload: Record<string, unknown>, prevBlock: number): string {
    const raw = JSON.stringify(payload) + prevBlock.toString();
    return "0x" + crypto.createHash("sha256").update(raw).digest("hex");
  }

  /**
   * Pre-seeds initial public event registry entities onto Arkiv.
   */
  private seedDefaultArkivEntities() {
    const initialEvents = [
      {
        id: "arkiv_entity_evt_mumbai_music",
        entityType: "event_registry" as const,
        ownerWallet: this.organizerWallet,
        payload: {
          eventId: "mumbai-music-festival",
          name: "Mumbai Music Festival 2026",
          venue: "Jio World Garden, BKC, Mumbai",
          date: "Dec 18–19, 2026",
          maxCapacity: 2500,
          antiScalpPriceCap: "110%",
          requiredProof: "world_id_v4_orb",
        },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        blockNumber: this.currentBlockHeight - 120,
        txHash: "0x3f9e8a71b2d4c6e80123456789abcdef0123456789abcdef0123456789abcdef",
        merkleRoot: "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
      },
      {
        id: "arkiv_entity_evt_ethglobal_mumbai",
        entityType: "event_registry" as const,
        ownerWallet: this.organizerWallet,
        payload: {
          eventId: "ethglobal-mumbai-2026",
          name: "ETHGlobal Mumbai 2026",
          venue: "Grand Hyatt Mumbai",
          date: "Nov 14–16, 2026",
          maxCapacity: 1000,
          antiScalpPriceCap: "0% (Free Hacker Pass Only)",
          requiredProof: "world_id_v4_orb_or_device",
        },
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        blockNumber: this.currentBlockHeight - 210,
        txHash: "0x4a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef",
        merkleRoot: "0x90123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      },
      {
        id: "arkiv_entity_evt_tech_summit",
        entityType: "event_registry" as const,
        ownerWallet: this.organizerWallet,
        payload: {
          eventId: "mumbai-tech-summit",
          name: "Mumbai Tech Summit 2027",
          venue: "NESCO Center, Goregaon",
          date: "Jan 22, 2027",
          maxCapacity: 600,
          antiScalpPriceCap: "110%",
          requiredProof: "world_id_v4_orb",
        },
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        blockNumber: this.currentBlockHeight - 340,
        txHash: "0x5b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
        merkleRoot: "0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      },
    ];

    for (const raw of initialEvents) {
      const merkleRoot = this.computeEntityHash(raw.payload, raw.blockNumber);
      this.entities.set(raw.id, { ...raw, merkleRoot });
    }
  }

  /**
   * Records a verified ticket claim into Arkiv's decentralized entity ledger.
   * Creates an immutable, public audit record tied to the recipient wallet.
   */
  public async recordAllocation(data: {
    eventId: string;
    ticketId: string;
    walletAddress: string;
    worldNullifierHash: string;
  }): Promise<ArkivEntity> {
    this.currentBlockHeight += 1;

    const payload: ArkivAllocationPayload = {
      eventId: data.eventId,
      ticketId: data.ticketId,
      walletAddress: data.walletAddress,
      // Store event-scoped nullifier for public audit trail verification
      worldNullifierHash: data.worldNullifierHash,
      status: "verified_claimed",
      claimedAt: new Date().toISOString(),
    };

    const entityId = `arkiv_alloc_${data.eventId}_${data.ticketId.replace(/[^a-zA-Z0-9]/g, "")}`;
    const merkleRoot = this.computeEntityHash(payload as unknown as Record<string, unknown>, this.currentBlockHeight);
    const txHash = "0x" + crypto.createHash("sha256").update(entityId + Date.now().toString()).digest("hex");

    const entity: ArkivEntity = {
      id: entityId,
      entityType: "ticket_allocation",
      ownerWallet: data.walletAddress,
      payload: payload as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blockNumber: this.currentBlockHeight,
      txHash,
      merkleRoot,
      ttlSeconds: 86400 * 365, // 1 year data lifecycle
    };

    this.entities.set(entityId, entity);

    // If live Arkiv RPC is provided, forward to live DB-Chain
    if (this.isLiveNetworkConfigured) {
      try {
        await fetch(`${this.rpcUrl}/entities/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ARKIV_PRIVATE_KEY}`,
          },
          body: JSON.stringify({
            schema: "fairdrop_ticket_allocation_v1",
            entityId,
            payload,
          }),
        });
      } catch (err) {
        console.warn("[Arkiv] Live network broadcast fallback to local DB-chain node:", err);
      }
    }

    return entity;
  }

  /**
   * Records a secondary ticket resale transaction or listing onto Arkiv.
   */
  public async recordResale(data: {
    ticketId: string;
    eventId: string;
    sellerWallet: string;
    buyerWallet?: string;
    originalPriceUsdc: number;
    resalePriceUsdc: number;
    status: "listed" | "settled" | "cancelled";
    arcSettlementTxHash?: string;
  }): Promise<ArkivEntity> {
    this.currentBlockHeight += 1;

    const payload: ArkivResalePayload = {
      ticketId: data.ticketId,
      eventId: data.eventId,
      sellerWallet: data.sellerWallet,
      buyerWallet: data.buyerWallet,
      originalPriceUsdc: data.originalPriceUsdc,
      resalePriceUsdc: data.resalePriceUsdc,
      status: data.status,
      arcSettlementTxHash: data.arcSettlementTxHash,
      listedAt: new Date().toISOString(),
      settledAt: data.status === "settled" ? new Date().toISOString() : undefined,
    };

    const entityId = `arkiv_resale_${data.ticketId.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;
    const merkleRoot = this.computeEntityHash(payload as unknown as Record<string, unknown>, this.currentBlockHeight);
    const txHash = "0x" + crypto.createHash("sha256").update(entityId).digest("hex");

    const entity: ArkivEntity = {
      id: entityId,
      entityType: "resale_record",
      ownerWallet: data.buyerWallet ?? data.sellerWallet,
      payload: payload as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blockNumber: this.currentBlockHeight,
      txHash,
      merkleRoot,
    };

    this.entities.set(entityId, entity);
    return entity;
  }

  /**
   * Queries indexed entities using typed filters (SQL-like retrieval over RPC).
   */
  public async queryRecords(filter: ArkivQueryFilter = {}): Promise<ArkivEntity[]> {
    let result = Array.from(this.entities.values());

    if (filter.entityType) {
      result = result.filter((e) => e.entityType === filter.entityType);
    }

    if (filter.eventId) {
      result = result.filter(
        (e) => (e.payload as { eventId?: string }).eventId === filter.eventId
      );
    }

    if (filter.walletAddress) {
      const lower = filter.walletAddress.toLowerCase();
      result = result.filter(
        (e) =>
          e.ownerWallet.toLowerCase() === lower ||
          ((e.payload as { walletAddress?: string }).walletAddress?.toLowerCase() === lower) ||
          ((e.payload as { sellerWallet?: string }).sellerWallet?.toLowerCase() === lower) ||
          ((e.payload as { buyerWallet?: string }).buyerWallet?.toLowerCase() === lower)
      );
    }

    if (filter.ticketId) {
      result = result.filter(
        (e) => (e.payload as { ticketId?: string }).ticketId === filter.ticketId
      );
    }

    // Sort descending by block number (newest first)
    result.sort((a, b) => b.blockNumber - a.blockNumber);

    if (filter.limit && filter.limit > 0) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  /**
   * Retrieves an entity by ID with its cryptographic verification proof.
   */
  public async getEntityById(id: string): Promise<{ entity: ArkivEntity; verified: boolean } | null> {
    const entity = this.entities.get(id);
    if (!entity) return null;

    // Verify Merkle hash
    const expectedHash = this.computeEntityHash(entity.payload, entity.blockNumber);
    const verified = expectedHash === entity.merkleRoot;

    return { entity, verified };
  }

  /**
   * Returns current node status and network health for the Arkiv DB-Chain.
   */
  public getNetworkStatus(): ArkivNetworkStatus {
    return {
      status: "ready",
      network: "Arkiv DB-Chain Testnet (Ethereum Sepolia L2/L3)",
      rpcUrl: this.rpcUrl,
      dbChainId: this.dbChainId,
      blockHeight: this.currentBlockHeight,
      totalEntities: this.entities.size,
      isMock: !this.isLiveNetworkConfigured,
    };
  }
}

export const arkivService = new ArkivIntegrationService();
