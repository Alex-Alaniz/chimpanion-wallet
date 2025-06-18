export interface User {
  id: string;
  twitterId: string;
  twitterHandle: string;
  twitterDisplayName: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  chain: SupportedChain;
  isActive: boolean;
  createdAt: Date;
}

export interface SupportedChain {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: number;
  isTestnet: boolean;
  type: 'evm' | 'solana';
}

export interface Balance {
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  usdValue?: number;
  decimals: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  tokenSymbol: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'deposit' | 'withdraw' | 'bet' | 'claim';
  createdAt: Date;
  confirmedAt?: Date;
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'news' | 'politics' | 'culture' | 'sports';
  endDate: Date;
  isResolved: boolean;
  winningOutcome?: string;
  totalVolume: string;
  outcomes: MarketOutcome[];
}

export interface MarketOutcome {
  id: string;
  name: string;
  odds: number;
  totalBets: string;
  isWinning?: boolean;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  outcomeId: string;
  amount: string;
  tokenSymbol: string;
  odds: number;
  status: 'pending' | 'placed' | 'won' | 'lost';
  createdAt: Date;
  settledAt?: Date;
  payout?: string;
}

export interface TerminalCommand {
  command: string;
  args: string[];
  description: string;
  examples: string[];
}

export interface SocialCommand {
  id: string;
  tweetId: string;
  userId: string;
  command: string;
  args: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface WalletAction {
  type: 'deposit' | 'withdraw' | 'balance' | 'bet' | 'claim' | 'markets';
  chain?: string;
  amount?: string;
  token?: string;
  marketId?: string;
  outcome?: string;
}

export interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    chainId: 8453,
    isTestnet: false,
    type: 'evm'
  },
  {
    id: 'apechain',
    name: 'ApeChain',
    symbol: 'APE',
    rpcUrl: process.env.NEXT_PUBLIC_APECHAIN_RPC_URL || 'https://apechain.calderachain.xyz/http',
    chainId: 33139,
    isTestnet: false,
    type: 'evm'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    chainId: 0, // Solana doesn't use chain IDs
    isTestnet: false,
    type: 'solana'
  }
];

export const AVAILABLE_COMMANDS: TerminalCommand[] = [
  {
    command: 'balance',
    args: ['[chain]', '[token]'],
    description: 'Check wallet balance for a specific chain and token',
    examples: ['balance', 'balance base', 'balance base ETH']
  },
  {
    command: 'deposit',
    args: ['<amount>', '<token>', '[chain]'],
    description: 'Deposit tokens to your wallet',
    examples: ['deposit 100 USDC base', 'deposit 1 ETH']
  },
  {
    command: 'withdraw',
    args: ['<amount>', '<token>', '<address>', '[chain]'],
    description: 'Withdraw tokens from your wallet',
    examples: ['withdraw 50 USDC 0x123... base', 'withdraw 0.5 ETH 0x456...']
  },
  {
    command: 'markets',
    args: ['[category]'],
    description: 'List available prediction markets',
    examples: ['markets', 'markets tech', 'markets politics']
  },
  {
    command: 'bet',
    args: ['<marketId>', '<outcome>', '<amount>', '[token]'],
    description: 'Place a bet on a prediction market',
    examples: ['bet market123 yes 100 USDC', 'bet market456 trump 50 ETH']
  },
  {
    command: 'bets',
    args: ['[status]'],
    description: 'View your betting history',
    examples: ['bets', 'bets pending', 'bets won']
  },
  {
    command: 'claim',
    args: ['<betId>'],
    description: 'Claim winnings from a successful bet',
    examples: ['claim bet789']
  },
  {
    command: 'help',
    args: ['[command]'],
    description: 'Show help information',
    examples: ['help', 'help bet', 'help withdraw']
  }
];

// Premium Membership Types (Legacy)
export interface PremiumMembership {
  userId: string;
  walletAddress: string;
  status: 'active' | 'expired' | 'pending';
  apesBalance: string;
  apesValueUSD: number;
  lastChecked: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Premium Subscription Types (New)
export interface PremiumSubscription {
  userId: string;
  status: 'active' | 'expired' | 'cancelled' | 'inactive';
  plan?: 'monthly' | 'yearly';
  amount?: number;
  currency?: string;
  paymentMethod?: 'crypto' | 'card';
  transactionHash?: string;
  autoRenew?: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    walletAddress?: string;
    txHash?: string;
    toolCalls?: any[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  walletAddress: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const MEMBERSHIP_CONFIG = {
  APES_TOKEN_ADDRESS: '9BZJXtmfPpkHnM57gHEx5Pc9oQhLhJtr4mhCsNtttTts',
  REQUIRED_USD_VALUE: 20,
  CHECK_INTERVAL_HOURS: 24,
  SOLANA_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
}; 