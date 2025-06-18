import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, length = 6): string {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCommand(input: string): { command: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  const command = parts[0] || '';
  const args = parts.slice(1);
  return { command: command.toLowerCase(), args };
}

export function generateWalletId(): string {
  return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function validateAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

export function getExplorerUrl(chain: string, txHash: string): string {
  switch (chain.toLowerCase()) {
    case 'base':
      return `https://basescan.org/tx/${txHash}`;
    case 'apechain':
      return `https://apechain.calderaexplorer.xyz/tx/${txHash}`;
    case 'solana':
      return `https://solscan.io/tx/${txHash}`;
    default:
      return '#';
  }
}

export function getChainIconUrl(chain: string): string {
  switch (chain.toLowerCase()) {
    case 'base':
      return '/icons/base.svg';
    case 'apechain':
      return '/icons/apechain.svg';
    case 'solana':
      return '/icons/solana.svg';
    default:
      return '/icons/default-chain.svg';
  }
} 