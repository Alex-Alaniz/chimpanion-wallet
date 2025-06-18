// Server-controlled wallets using PrivyWalletProvider from AgentKit
import { 
  PrivyWalletProvider,
  PrivyEvmWalletProvider,
  PrivySvmWalletProvider,
  type PrivyEvmWalletConfig,
  type PrivySvmWalletConfig,
} from '@coinbase/agentkit';
import { Connection } from '@solana/web3.js';
import { CHAIN_CONFIG } from './multi-chain-wallet';
import crypto from 'crypto';
import { getUserWalletData, storeUserWalletData } from './wallet-storage-adapter';

// Cache for wallet providers
const evmWalletProviders = new Map<string, PrivyEvmWalletProvider>();
const solanaWalletProviders = new Map<string, PrivySvmWalletProvider>();

// Create a stable user ID from wallet address
function createStableUserId(walletAddress: string): string {
  return crypto.createHash('sha256').update(walletAddress).digest('hex').substring(0, 16);
}

// Get or create an EVM wallet provider for a user
// This returns the SAME wallet provider for all EVM chains
export async function getEvmWalletProvider(
  userWalletAddress: string,
  chain?: 'base' | 'apechain'
): Promise<PrivyEvmWalletProvider> {
  const userId = createStableUserId(userWalletAddress);
  // Use a single cache key for all EVM chains
  const cacheKey = `${userId}-evm`;
  
  // Check cache first
  if (evmWalletProviders.has(cacheKey)) {
    console.log(`📦 Using cached EVM wallet provider for user ${userId}`);
    return evmWalletProviders.get(cacheKey)!;
  }

  // Check if we have stored wallet data
  const storedWalletData = await getUserWalletData(userWalletAddress);
  const existingWalletId = storedWalletData?.evm?.walletId;

  // Use Base as the default chain for wallet creation
  // The wallet will work on all EVM chains
  const defaultChainId = '8453'; // Base mainnet
  
  const config: PrivyEvmWalletConfig = {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    appSecret: process.env.PRIVY_APP_SECRET!,
    chainId: defaultChainId,
  };

  // If we have an existing wallet ID, use it
  if (existingWalletId) {
    config.walletId = existingWalletId;
    console.log(`🔑 Using existing EVM wallet ID for user ${userId}: ${existingWalletId}`);
  } else {
    console.log(`🆕 Creating new EVM wallet for user ${userId}`);
  }

  try {
    const walletProvider = await PrivyWalletProvider.configureWithWallet({
      ...config,
      chainType: 'ethereum' as const,
    }) as PrivyEvmWalletProvider;
    
    // Get wallet data
    const walletData = walletProvider.exportWallet();
    const address = walletProvider.getAddress();
    
    // Store wallet data if it's new
    if (!existingWalletId) {
      // Get auth method from stored data or default to 'unknown'
      const authMethod = storedWalletData ? 
        (await import('./wallet-storage')).walletStorage.getMapping(userWalletAddress)?.authMethod || 'unknown' :
        'unknown';
      
      await storeUserWalletData(
        userWalletAddress,
        authMethod,
        { address, walletId: walletData.walletId },
        storedWalletData?.solana // Keep existing Solana wallet if any
      );
      console.log(`💾 Stored new EVM wallet data for user ${userId}`);
    }
    
    evmWalletProviders.set(cacheKey, walletProvider);
    console.log(`✅ EVM wallet ready for user ${userId}: ${address}`);
    console.log(`   Wallet ID: ${walletData.walletId}`);
    console.log(`   This wallet works on all EVM chains (Base, ApeChain, etc.)`);
    return walletProvider;
  } catch (error) {
    console.error('Error creating EVM wallet provider:', error);
    throw new Error(`Failed to create wallet provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get or create a Solana wallet provider for a user
export async function getSolanaWalletProvider(
  userWalletAddress: string
): Promise<PrivySvmWalletProvider> {
  const userId = createStableUserId(userWalletAddress);
  const cacheKey = `${userId}-solana`;
  
  // Check cache first
  if (solanaWalletProviders.has(cacheKey)) {
    console.log(`📦 Using cached Solana wallet provider for user ${userId}`);
    return solanaWalletProviders.get(cacheKey)!;
  }

  // Check if we have stored wallet data
  const storedWalletData = await getUserWalletData(userWalletAddress);
  const existingWalletId = storedWalletData?.solana?.walletId;

  // Create Solana connection
  const connection = new Connection(CHAIN_CONFIG.solana.rpcUrl);
  
  const config: PrivySvmWalletConfig = {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    appSecret: process.env.PRIVY_APP_SECRET!,
    connection,
    networkId: 'solana-mainnet-beta',
    walletType: 'server' as const,
  };

  // If we have an existing wallet ID, use it
  if (existingWalletId) {
    config.walletId = existingWalletId;
    console.log(`🔑 Using existing Solana wallet ID for user ${userId}: ${existingWalletId}`);
  } else {
    console.log(`🆕 Creating new Solana wallet for user ${userId}`);
  }

  try {
    const walletProvider = await PrivyWalletProvider.configureWithWallet({
      ...config,
      chainType: 'solana' as const,
    }) as PrivySvmWalletProvider;
    
    // Get wallet data
    const walletData = walletProvider.exportWallet();
    const address = walletProvider.getAddress();
    
    // Store wallet data if it's new
    if (!existingWalletId) {
      // Get auth method from stored data or default to 'unknown'
      const authMethod = storedWalletData ? 
        (await import('./wallet-storage')).walletStorage.getMapping(userWalletAddress)?.authMethod || 'unknown' :
        'unknown';
      
      await storeUserWalletData(
        userWalletAddress,
        authMethod,
        storedWalletData?.evm, // Keep existing EVM wallet if any
        { address, walletId: walletData.walletId }
      );
      console.log(`💾 Stored new Solana wallet data for user ${userId}`);
    }
    
    solanaWalletProviders.set(cacheKey, walletProvider);
    console.log(`✅ Solana wallet ready for user ${userId}: ${address}`);
    console.log(`   Wallet ID: ${walletData.walletId}`);
    return walletProvider;
  } catch (error) {
    console.error('Error creating Solana wallet provider:', error);
    throw new Error(`Failed to create wallet provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export wallet information for EVM
export async function exportEvmWalletInfo(walletProvider: PrivyEvmWalletProvider) {
  try {
    const walletData = walletProvider.exportWallet();
    return {
      ...walletData,
      address: walletProvider.getAddress(),
    };
  } catch (error) {
    console.error('Error exporting EVM wallet:', error);
    throw error;
  }
}

// Export wallet information for Solana
export async function exportSolanaWalletInfo(walletProvider: PrivySvmWalletProvider) {
  try {
    const walletData = walletProvider.exportWallet();
    return {
      ...walletData,
      address: walletProvider.getAddress(),
    };
  } catch (error) {
    console.error('Error exporting Solana wallet:', error);
    throw error;
  }
}

// Clear cache for a user (useful for cleanup)
export function clearUserWallets(userWalletAddress: string) {
  const userId = createStableUserId(userWalletAddress);
  const evmKey = `${userId}-evm`;
  const solanaKey = `${userId}-solana`;
  
  // Clear EVM wallet
  if (evmWalletProviders.has(evmKey)) {
    evmWalletProviders.delete(evmKey);
  }
  
  // Clear Solana wallet
  if (solanaWalletProviders.has(solanaKey)) {
    solanaWalletProviders.delete(solanaKey);
  }
}

// Get server wallet address for a user (for display purposes)
export async function getServerWalletAddresses(userWalletAddress: string) {
  const userId = createStableUserId(userWalletAddress);
  
  // First check if we have stored wallets
  try {
    const { getUserWallets } = await import('./wallet-storage-adapter');
    const storedWallets = await getUserWallets(userWalletAddress);
    if (storedWallets && storedWallets.base && storedWallets.solana) {
      // Use the same EVM address for all EVM chains
      return {
        base: storedWallets.base,
        apechain: storedWallets.base, // Same as base
        solana: storedWallets.solana
      };
    }
  } catch (error) {
    // Wallet storage might not be available, continue with normal flow
  }

  const addresses: Record<string, string | null> = {
    'base': null,
    'apechain': null,
    'solana': null,
  };

  // Check cached providers
  const evmCacheKey = `${userId}-evm`;
  const solanaCacheKey = `${userId}-solana`;

  // Get EVM address (same for all EVM chains)
  if (evmWalletProviders.has(evmCacheKey)) {
    const evmAddress = evmWalletProviders.get(evmCacheKey)!.getAddress();
    addresses.base = evmAddress;
    addresses.apechain = evmAddress; // Same address for all EVM chains
  }
  
  // Get Solana address
  if (solanaWalletProviders.has(solanaCacheKey)) {
    addresses.solana = solanaWalletProviders.get(solanaCacheKey)!.getAddress();
  }

  return addresses;
} 