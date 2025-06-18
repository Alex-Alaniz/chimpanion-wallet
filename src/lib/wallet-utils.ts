import { createPublicClient, http, formatEther, getAddress } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Define ApeChain
const apeChain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: {
    decimals: 18,
    name: 'APE',
    symbol: 'APE',
  },
  rpcUrls: {
    default: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://apechain.calderachain.xyz' },
  },
};

export interface WalletBalance {
  address: string;
  balance: string;
  balanceUSD: string;
  symbol: string;
  chain: string;
}

// Create clients for different chains - using mainnet for real balances
// Change to baseSepolia if testing on testnet
const baseClient = createPublicClient({
  chain: process.env.NEXT_PUBLIC_USE_TESTNET === 'true' ? baseSepolia : base,
  transport: http(),
});

const apeChainClient = createPublicClient({
  chain: apeChain,
  transport: http(),
});

// Solana connection - using Alchemy RPC for reliable access
const solanaConnection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/LB4s_CFb80irvbKFWL6qN',
  'confirmed'
);

export async function getBaseBalance(address: string): Promise<WalletBalance> {
  try {
    const balance = await baseClient.getBalance({
      address: getAddress(address),
    });
    
    const ethBalance = formatEther(balance);
    
    return {
      address,
      balance: ethBalance,
      balanceUSD: (parseFloat(ethBalance) * 3000).toFixed(2), // Rough ETH price
      symbol: 'ETH',
      chain: 'Base',
    };
  } catch (error) {
    console.error('Error fetching Base balance:', error);
    return {
      address,
      balance: '0',
      balanceUSD: '0',
      symbol: 'ETH',
      chain: 'Base',
    };
  }
}

export async function getApeChainBalance(address: string): Promise<WalletBalance> {
  try {
    const balance = await apeChainClient.getBalance({
      address: getAddress(address),
    });
    
    const apeBalance = formatEther(balance);
    
    return {
      address,
      balance: apeBalance,
      balanceUSD: (parseFloat(apeBalance) * 1.5).toFixed(2), // Rough APE price
      symbol: 'APE',
      chain: 'ApeChain',
    };
  } catch (error) {
    console.error('Error fetching ApeChain balance:', error);
    return {
      address,
      balance: '0',
      balanceUSD: '0',
      symbol: 'APE',
      chain: 'ApeChain',
    };
  }
}

export async function getSolanaBalance(address: string): Promise<WalletBalance> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await solanaConnection.getBalance(publicKey);
    const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
    
    return {
      address,
      balance: solBalance,
      balanceUSD: (parseFloat(solBalance) * 150).toFixed(2), // Rough SOL price
      symbol: 'SOL',
      chain: 'Solana',
    };
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return {
      address,
      balance: '0',
      balanceUSD: '0',
      symbol: 'SOL',
      chain: 'Solana',
    };
  }
}

export async function getAllWalletBalances(wallets: {
  evm?: string;
  solana?: string;
}): Promise<WalletBalance[]> {
  const balances: WalletBalance[] = [];

  // Fetch all balances in parallel
  const promises = [];

  if (wallets.evm) {
    promises.push(getBaseBalance(wallets.evm));
    promises.push(getApeChainBalance(wallets.evm));
  }

  if (wallets.solana) {
    promises.push(getSolanaBalance(wallets.solana));
  }

  const results = await Promise.allSettled(promises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      balances.push(result.value);
    }
  });

  return balances;
} 