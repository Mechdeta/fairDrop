export const ARC_TESTNET_CONFIG = {
  chainIdDecimal: 9824,
  chainIdHex: "0x2660",
  chainName: "Arc Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://testnet-rpc.arc.network",
  blockExplorerUrl: "https://testnet-explorer.arc.network",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
} as const;

/**
 * Returns true if the provided chainId (in number or hex string format) corresponds to Arc Testnet.
 */
export function isArcChain(chainId: number | string | null | undefined): boolean {
  if (chainId === null || chainId === undefined) return false;
  if (typeof chainId === "number") {
    return chainId === ARC_TESTNET_CONFIG.chainIdDecimal;
  }
  const cleanHex = chainId.toLowerCase();
  return cleanHex === ARC_TESTNET_CONFIG.chainIdHex.toLowerCase() ||
         parseInt(cleanHex, 16) === ARC_TESTNET_CONFIG.chainIdDecimal;
}

/**
 * Format raw chain ID into a readable network name.
 */
export function getChainDisplayName(chainId: number | null): string {
  if (!chainId) return "Unknown Network";
  if (isArcChain(chainId)) return ARC_TESTNET_CONFIG.chainName;
  if (chainId === 1) return "Ethereum Mainnet";
  if (chainId === 11155111) return "Sepolia Testnet";
  if (chainId === 137) return "Polygon";
  if (chainId === 80002) return "Polygon Amoy";
  if (chainId === 8453) return "Base";
  if (chainId === 84532) return "Base Sepolia";
  if (chainId === 31337 || chainId === 1337) return "Localhost / Hardhat";
  return `Chain ID ${chainId}`;
}

