import {
  SupportedWalletId,
  EIP1193Provider,
  WalletOptionInfo,
} from "./types";
import { ARC_TESTNET_CONFIG, isArcChain, getChainDisplayName } from "./arc-config";

/**
 * Window extension interface for discovering injected Web3 providers.
 */
interface WindowWithEthereum extends Window {
  ethereum?: EIP1193Provider;
  coinbaseWalletExtension?: EIP1193Provider;
  rainbow?: EIP1193Provider;
}

/**
 * Helper to get the window object safely.
 */
function getWindow(): WindowWithEthereum | undefined {
  if (typeof window !== "undefined") {
    return window as unknown as WindowWithEthereum;
  }
  return undefined;
}

/**
 * Detects presence of installed Web3 providers.
 */
export function detectWalletProviders(): Record<SupportedWalletId, boolean> {
  const win = getWindow();
  if (!win) {
    return { metamask: false, coinbase: false, rainbow: false, generic: false };
  }

  const eth = win.ethereum;
  const providers = Array.isArray(eth?.providers) ? eth.providers : [];

  const isMetaMaskDetected = Boolean(
    eth?.isMetaMask ||
    providers.some((p) => p.isMetaMask)
  );

  const isCoinbaseDetected = Boolean(
    win.coinbaseWalletExtension ||
    eth?.isCoinbaseWallet ||
    providers.some((p) => p.isCoinbaseWallet)
  );

  const isRainbowDetected = Boolean(
    win.rainbow ||
    eth?.isRainbow ||
    providers.some((p) => p.isRainbow)
  );

  const isGenericDetected = Boolean(eth || win.coinbaseWalletExtension || win.rainbow);

  return {
    metamask: isMetaMaskDetected,
    coinbase: isCoinbaseDetected,
    rainbow: isRainbowDetected,
    generic: isGenericDetected,
  };
}

/**
 * Returns supported wallet options metadata and installation links.
 */
export function getSupportedWalletOptions(): WalletOptionInfo[] {
  const detected = detectWalletProviders();

  return [
    {
      id: "metamask",
      name: "MetaMask",
      desc: detected.metamask
        ? "Extension detected — click to connect your real account"
        : "Connect using official browser extension",
      icon: "🦊",
      isDetected: detected.metamask,
      downloadUrl: "https://metamask.io/download/",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      desc: detected.coinbase
        ? "Extension detected — click to connect your real account"
        : "Connect via Coinbase Wallet extension",
      icon: "🔵",
      isDetected: detected.coinbase,
      downloadUrl: "https://www.coinbase.com/wallet",
    },
    {
      id: "rainbow",
      name: "Rainbow",
      desc: detected.rainbow
        ? "Extension detected — click to connect your real account"
        : "Connect via Rainbow wallet extension",
      icon: "🌈",
      isDetected: detected.rainbow,
      downloadUrl: "https://rainbow.me/download",
    },
    {
      id: "generic",
      name: "Browser Injected Wallet",
      desc: detected.generic
        ? "Compatible EIP-1193 Web3 provider detected"
        : "Any standard injected Web3 browser wallet",
      icon: "⚡",
      isDetected: detected.generic,
      downloadUrl: "https://metamask.io/download/",
    },
  ];
}

/**
 * Retrieves the specific provider corresponding to the requested wallet id.
 */
export function getProviderForWallet(walletId: SupportedWalletId): EIP1193Provider | null {
  const win = getWindow();
  if (!win) return null;

  const eth = win.ethereum;
  const providers = Array.isArray(eth?.providers) ? eth.providers : [];

  if (walletId === "coinbase") {
    if (win.coinbaseWalletExtension) return win.coinbaseWalletExtension;
    const found = providers.find((p) => p.isCoinbaseWallet);
    if (found) return found;
    if (eth?.isCoinbaseWallet) return eth;
    return null;
  }

  if (walletId === "rainbow") {
    if (win.rainbow) return win.rainbow;
    const found = providers.find((p) => p.isRainbow);
    if (found) return found;
    if (eth?.isRainbow) return eth;
    return null;
  }

  if (walletId === "metamask") {
    const found = providers.find((p) => p.isMetaMask);
    if (found) return found;
    if (eth?.isMetaMask) return eth;
    return null;
  }

  // Generic fallback
  return eth || win.coinbaseWalletExtension || win.rainbow || null;
}

/**
 * Initiates user-approved connection to the selected wallet provider.
 * Throws explicit user-friendly errors if the wallet is missing or request is rejected.
 */
export async function connectWallet(walletId: SupportedWalletId): Promise<{
  address: string;
  chainId: number;
  provider: EIP1193Provider;
}> {
  const provider = getProviderForWallet(walletId);

  if (!provider) {
    if (walletId === "metamask") {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask or choose another supported wallet."
      );
    }
    if (walletId === "coinbase") {
      throw new Error(
        "Coinbase Wallet is not installed. Please install Coinbase Wallet or choose another supported wallet."
      );
    }
    if (walletId === "rainbow") {
      throw new Error(
        "Rainbow is not installed. Please install Rainbow or choose another supported wallet."
      );
    }
    throw new Error(
      "No compatible Web3 wallet detected in this browser. Please install a supported wallet extension."
    );
  }

  try {
    // Request accounts from provider
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0 || !accounts[0]) {
      throw new Error("No accounts were returned by the wallet provider.");
    }

    const address = accounts[0].trim();

    // Query active chain ID
    const hexChainId = (await provider.request({
      method: "eth_chainId",
    })) as string;

    const chainId = parseInt(hexChainId, 16);

    return {
      address,
      chainId,
      provider,
    };
  } catch (err: unknown) {
    const anyErr = err as { code?: number; message?: string };
    if (anyErr.code === 4001 || anyErr.message?.toLowerCase().includes("rejected")) {
      throw new Error("Connection request was rejected by the user. Please approve the connection in your wallet.");
    }
    throw new Error(anyErr.message || "Failed to connect to wallet provider.");
  }
}

/**
 * Switches the connected wallet to Arc Testnet (Chain ID 9824).
 * If the chain has not been added to the wallet yet, prompts wallet_addEthereumChain.
 * Re-queries eth_chainId to verify the chain actually switched.
 */
export async function switchOrAddArcNetwork(provider: EIP1193Provider): Promise<{
  success: boolean;
  chainId: number;
  chainName: string;
}> {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET_CONFIG.chainIdHex }],
    });
  } catch (switchError: unknown) {
    const anyErr = switchError as { code?: number; message?: string };
    // 4902 indicates chain is not yet added to wallet
    if (anyErr.code === 4902 || anyErr.message?.toLowerCase().includes("unrecognized") || anyErr.message?.toLowerCase().includes("not added")) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ARC_TESTNET_CONFIG.chainIdHex,
              chainName: ARC_TESTNET_CONFIG.chainName,
              nativeCurrency: ARC_TESTNET_CONFIG.nativeCurrency,
              rpcUrls: [ARC_TESTNET_CONFIG.rpcUrl],
              blockExplorerUrls: [ARC_TESTNET_CONFIG.blockExplorerUrl],
            },
          ],
        });
      } catch (addError: unknown) {
        const addErr = addError as { code?: number; message?: string };
        if (addErr.code === 4001) {
          throw new Error("Network switch request was rejected in your wallet.");
        }
        throw new Error(addErr.message || "Failed to add Arc Testnet to your wallet.");
      }
    } else if (anyErr.code === 4001) {
      throw new Error("Network switch request was rejected in your wallet.");
    } else {
      throw new Error(anyErr.message || "Failed to switch network to Arc Testnet.");
    }
  }

  // Re-verify actual connected chain ID after switch
  const hexChainId = (await provider.request({
    method: "eth_chainId",
  })) as string;
  const verifiedChainId = parseInt(hexChainId, 16);

  return {
    success: isArcChain(verifiedChainId),
    chainId: verifiedChainId,
    chainName: getChainDisplayName(verifiedChainId),
  };
}

/**
 * Fetches real on-chain balance using eth_getBalance.
 * Converts raw hex wei to formatted token balance.
 * Returns correct token symbol ("USDC" on Arc Testnet, native token otherwise).
 */
export async function fetchWalletBalance(
  provider: EIP1193Provider,
  address: string,
  chainId: number | null
): Promise<{ balance: string; symbol: string }> {
  try {
    const hexBalance = (await provider.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })) as string;

    if (!hexBalance || hexBalance === "0x") {
      return { balance: "0.00", symbol: isArcChain(chainId) ? "USDC" : "ETH" };
    }

    const wei = BigInt(hexBalance);
    const whole = wei / BigInt(10 ** 18);
    const fraction = wei % BigInt(10 ** 18);
    const fractionNum = Number(fraction) / 1e18;
    const total = Number(whole) + fractionNum;

    return {
      balance: total.toFixed(2),
      symbol: isArcChain(chainId) ? "USDC" : "ETH",
    };
  } catch (err) {
    console.warn("Failed to fetch on-chain balance via provider:", err);
    throw new Error("Unable to retrieve live on-chain balance from the connected network.");
  }
}

/**
 * Prepares and sends a real native USDC payment transaction on Arc Testnet via eth_sendTransaction.
 * Validates network, checks balance, requests wallet approval, and returns the genuine transaction hash.
 */
export async function sendArcPayment({
  provider,
  fromAddress,
  toAddress,
  amountUsdc,
  currentBalance,
}: {
  provider: EIP1193Provider;
  fromAddress: string;
  toAddress: string;
  amountUsdc: number;
  currentBalance: number;
}): Promise<string> {
  // 1. Verify network is Arc Testnet
  const hexChainId = (await provider.request({ method: "eth_chainId" })) as string;
  const chainId = parseInt(hexChainId, 16);
  if (!isArcChain(chainId)) {
    throw new Error("Please switch your wallet network to Arc Testnet before completing this payment.");
  }

  // 2. Check sufficient balance
  if (currentBalance < amountUsdc) {
    throw new Error("You don't have enough USDC to complete this purchase.");
  }

  // 3. Format value in hex wei (18 decimals for Arc native USDC)
  const weiAmount = BigInt(Math.floor(amountUsdc * 1e6)) * BigInt(1e12);
  const valueHex = "0x" + weiAmount.toString(16);

  // 4. Request user transaction approval in wallet
  try {
    const txHash = (await provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to: toAddress,
          value: valueHex,
        },
      ],
    })) as string;

    if (!txHash || typeof txHash !== "string" || !txHash.startsWith("0x")) {
      throw new Error("Invalid transaction response returned by wallet.");
    }

    return txHash;
  } catch (err: unknown) {
    const anyErr = err as { code?: number; message?: string };
    if (anyErr.code === 4001 || anyErr.message?.toLowerCase().includes("rejected")) {
      throw new Error("Transaction was rejected in your wallet.");
    }
    throw new Error(anyErr.message || "Payment transaction failed.");
  }
}

/**
 * Polls provider for transaction receipt confirmation.
 */
export async function waitForTransactionReceipt(
  provider: EIP1193Provider,
  txHash: string,
  maxWaitMs: number = 20000
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    try {
      const receipt = await provider.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      });
      if (receipt && typeof receipt === "object") {
        return true;
      }
    } catch {
      // Continue polling
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

