/**
 * Arkiv DB-Chain Network Configuration
 * ETHGlobal Mumbai 2026 Testnet
 */

export interface ArkivConfig {
  rpcUrl: string;
  indexerUrl: string;
  chainId: number;
  accessKey: string;
  privateKey?: `0x${string}`;
  defaultTtlDays: number;
  isTestnet: boolean;
}

export function getArkivConfig(): ArkivConfig {
  const rpcUrl =
    process.env.ARKIV_RPC_URL ||
    "https://rpc.rabdi.db-chain.testnet.arkiv.network";

  const indexerUrl =
    process.env.ARKIV_INDEXER_URL ||
    "https://indexer.rabdi.db-chain.testnet.arkiv.network";

  const chainId = Number(process.env.ARKIV_CHAIN_ID || 7794095);
  const accessKey = process.env.ARKIV_ACCESS_KEY || "";
  const rawPrivateKey = process.env.ARKIV_PRIVATE_KEY;

  const privateKey = rawPrivateKey
    ? (rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`) as `0x${string}`
    : undefined;

  return {
    rpcUrl,
    indexerUrl,
    chainId,
    accessKey,
    privateKey,
    defaultTtlDays: 90, // 90 days lifecycle for public event listings
    isTestnet: true,
  };
}
