/**
 * Arc Protocol & USDC Native Settlement Integration (Circle Layer-1)
 * Arc uses USDC as the native gas and settlement token.
 * Provides programmable conditional escrows and anti-scalping price ceiling enforcement.
 */

export interface ArcResaleListing {
  id: string;
  ticketId: string;
  eventId: string;
  eventName: string;
  tier: string;
  sellerWallet: string;
  originalPriceUsdc: number;
  resalePriceUsdc: number;
  priceCapMaxUsdc: number;
  markupPercent: number;
  organizerRoyaltyPercent: number;
  status: "Available" | "Pending Settlement" | "Sold" | "Cancelled";
  settlementNetwork: string;
  createdAt: string;
  soldAt?: string;
  buyerWallet?: string;
  txHash?: string;
}

export interface ArcSettlementResult {
  success: boolean;
  listingId: string;
  ticketId: string;
  buyerWallet: string;
  sellerWallet: string;
  totalUsdcPaid: number;
  sellerProceedsUsdc: number;
  organizerRoyaltyUsdc: number;
  gasToken: "USDC";
  estimatedGasFeeUsdc: number;
  txHash: string;
  blockNumber: number;
  newOwnershipTokenId: string;
  settledAt: string;
}

export interface ArcPriceCapValidation {
  valid: boolean;
  originalPrice: number;
  requestedPrice: number;
  maxAllowedPrice: number;
  maxMarkupPercent: number;
  error?: string;
}

export interface ArcNetworkStatus {
  status: "online" | "congested" | "maintenance";
  network: string;
  chainId: number;
  rpcUrl: string;
  nativeGasToken: "USDC";
  usdcContractAddress: string;
  escrowContractAddress: string;
  blockHeight: number;
  isMock: boolean;
}
