// Unified storage adapter that switches between file and database storage
import { WalletData, walletStorage as fileStorage, getInitializationLock as fileGetLock } from './wallet-storage';
import { dbOperations } from './database/wallet-db';

// Check if we're using database storage
// Support both DATABASE_URL and POSTGRES_URL (Supabase uses POSTGRES_URL)
const USE_DATABASE = (process.env.DATABASE_URL || process.env.POSTGRES_URL) && process.env.NODE_ENV === 'production';

// Unified storage interface
export const storageAdapter = {
  // Store user wallet data
  async storeUserWalletData(
    userIdentifier: string,
    authMethod: string,
    evmData?: WalletData,
    solanaData?: WalletData
  ): Promise<void> {
    if (USE_DATABASE) {
      await dbOperations.storeUserWallets(userIdentifier, authMethod, evmData, solanaData);
    } else {
      // Use file storage
      const wallets: { evm?: WalletData; solana?: WalletData } = {};
      if (evmData) wallets.evm = evmData;
      if (solanaData) wallets.solana = solanaData;
      fileStorage.storeMapping(userIdentifier, authMethod, wallets);
    }
  },

  // Get user wallet data
  async getUserWalletData(userIdentifier: string): Promise<{ evm?: WalletData; solana?: WalletData } | null> {
    if (USE_DATABASE) {
      return await dbOperations.getUserWallets(userIdentifier);
    } else {
      const mapping = fileStorage.getMapping(userIdentifier);
      return mapping?.wallets || null;
    }
  },

  // Check if user has wallets
  async hasUserWallets(userIdentifier: string): Promise<boolean> {
    if (USE_DATABASE) {
      return await dbOperations.hasUserWallets(userIdentifier);
    } else {
      return fileStorage.hasWallets(userIdentifier);
    }
  },

  // Get initialization lock
  async getInitializationLock(userIdentifier: string): Promise<() => void> {
    // For database, we rely on database transactions and constraints
    // For file storage, use the in-memory lock
    if (USE_DATABASE) {
      // Return a no-op function since database handles concurrency
      return () => {};
    } else {
      return await fileGetLock(userIdentifier);
    }
  },

  // Legacy format support
  async getUserWallets(userIdentifier: string): Promise<{ base: string | null; apechain: string | null; solana: string | null } | null> {
    const walletData = await this.getUserWalletData(userIdentifier);
    if (!walletData) return null;
    
    return {
      base: walletData.evm?.address || null,
      apechain: walletData.evm?.address || null, // Same as base
      solana: walletData.solana?.address || null
    };
  }
};

// Export convenience functions that use the adapter
export async function storeUserWalletData(
  userIdentifier: string,
  authMethod: string,
  evmData?: WalletData,
  solanaData?: WalletData
): Promise<void> {
  return storageAdapter.storeUserWalletData(userIdentifier, authMethod, evmData, solanaData);
}

export async function getUserWalletData(userIdentifier: string) {
  return storageAdapter.getUserWalletData(userIdentifier);
}

export async function hasUserWallets(userIdentifier: string) {
  return storageAdapter.hasUserWallets(userIdentifier);
}

export async function getInitializationLock(userIdentifier: string) {
  return storageAdapter.getInitializationLock(userIdentifier);
}

export async function getUserWallets(userIdentifier: string) {
  return storageAdapter.getUserWallets(userIdentifier);
}

// Re-export WalletData type
export type { WalletData } from './wallet-storage';

console.log(`💾 Storage mode: ${USE_DATABASE ? 'Database' : 'File-based'}`); 