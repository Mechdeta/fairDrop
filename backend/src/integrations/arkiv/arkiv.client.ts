import {
  createPublicClient,
  createWalletClient,
} from "@arkiv-network/sdk";
import { rabdi } from "@arkiv-network/sdk/chains";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getArkivConfig } from "./arkiv.config.js";

let publicClientInstance: ReturnType<typeof createPublicClient> | null = null;
let walletClientInstance: ReturnType<typeof createWalletClient> | null = null;

/**
 * Returns a configured Viem-extended public client connected to the Arkiv Rabdi testnet.
 */
export function getArkivPublicClient() {
  if (!publicClientInstance) {
    const config = getArkivConfig();
    const chain = rabdi({ accessKey: config.accessKey });
    publicClientInstance = createPublicClient({
      chain,
      transport: http(config.rpcUrl),
    });
  }
  return publicClientInstance;
}

/**
 * Returns a configured Viem-extended wallet client for creating and patching entities on Arkiv.
 * Returns null if no private key is configured in the environment.
 */
export function getArkivWalletClient() {
  const config = getArkivConfig();
  if (!config.privateKey) {
    return null;
  }

  if (!walletClientInstance) {
    const chain = rabdi({ accessKey: config.accessKey });
    const account = privateKeyToAccount(config.privateKey);
    walletClientInstance = createWalletClient({
      account,
      chain,
      transport: http(config.rpcUrl),
    });
  }
  return walletClientInstance;
}

/**
 * Verifies live connection to Arkiv DB-Chain Rabdi testnet.
 */
export async function checkArkivHealth(): Promise<{
  online: boolean;
  blockHeight?: number;
  rpcUrl: string;
  error?: string;
}> {
  const config = getArkivConfig();
  try {
    const client = getArkivPublicClient();
    const blockNumber = await client.getBlockNumber();
    return {
      online: true,
      blockHeight: Number(blockNumber),
      rpcUrl: config.rpcUrl,
    };
  } catch (err: unknown) {
    const anyErr = err as { message?: string };
    return {
      online: false,
      rpcUrl: config.rpcUrl,
      error: anyErr.message || "Unable to reach Arkiv RPC node.",
    };
  }
}
