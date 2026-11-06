export type SupportedWalletId = "metamask" | "coinbase" | "rainbow" | "generic";

export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRainbow?: boolean;
  providers?: EIP1193Provider[];
}

export interface WalletOptionInfo {
  id: SupportedWalletId;
  name: string;
  desc: string;
  icon: string;
  isDetected: boolean;
  downloadUrl: string;
}

export interface ConnectedWalletState {
  address: string;
  chainId: number | null;
  chainName: string;
  isArcTestnet: boolean;
  balance: string | null;
  currencySymbol: string;
  isLoadingBalance: boolean;
  balanceError: string | null;
  provider: EIP1193Provider | null;
  walletId: SupportedWalletId | null;
}

