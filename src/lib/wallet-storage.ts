// Wallet storage for persistent user wallet mappings
// In production, replace this with a database
import fs from 'fs';
import path from 'path';

export interface WalletData {
  address: string;
  walletId: string;
}

interface WalletMapping {
  userIdentifier: string;
  authMethod: string;
  wallets: {
    evm?: WalletData;
    solana?: WalletData;
  };
  createdAt: Date;
  lastAccessed: Date;
}

// File path for persistent storage (development only)
const STORAGE_FILE = path.join(process.cwd(), '.wallet-storage.json');

// Initialization locks to prevent concurrent wallet creation
const initializationLocks = new Map<string, Promise<void>>();

class WalletStorage {
  private mappings: Map<string, WalletMapping> = new Map();

  constructor() {
    // Load from file on initialization
    this.loadFromFile();
  }

  // Load data from file
  private loadFromFile() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        
        // Convert dates back from strings
        parsed.forEach((mapping: any) => {
          mapping.createdAt = new Date(mapping.createdAt);
          mapping.lastAccessed = new Date(mapping.lastAccessed);
          this.mappings.set(mapping.userIdentifier, mapping);
        });
        
        console.log(`📂 Loaded ${this.mappings.size} wallet mappings from storage`);
      }
    } catch (error) {
      console.error('Error loading wallet storage:', error);
    }
  }

  // Save data to file
  private saveToFile() {
    try {
      const data = Array.from(this.mappings.values());
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
      console.log(`💾 Saved ${data.length} wallet mappings to storage`);
    } catch (error) {
      console.error('Error saving wallet storage:', error);
    }
  }

  // Store wallet mapping with IDs
  storeMapping(userIdentifier: string, authMethod: string, wallets: WalletMapping['wallets']) {
    const mapping: WalletMapping = {
      userIdentifier,
      authMethod,
      wallets,
      createdAt: this.mappings.get(userIdentifier)?.createdAt || new Date(),
      lastAccessed: new Date(),
    };
    
    this.mappings.set(userIdentifier, mapping);
    console.log(`💾 Stored wallet mapping for ${userIdentifier}:`, {
      evm: wallets.evm?.address,
      solana: wallets.solana?.address
    });
    
    // Save to file after each update
    this.saveToFile();
  }

  // Get wallet mapping
  getMapping(userIdentifier: string): WalletMapping | null {
    const mapping = this.mappings.get(userIdentifier);
    if (mapping) {
      mapping.lastAccessed = new Date();
      this.saveToFile(); // Update last accessed time
      return mapping;
    }
    return null;
  }

  // Check if user has wallets
  hasWallets(userIdentifier: string): boolean {
    return this.mappings.has(userIdentifier);
  }

  // Get all users (for admin/debugging)
  getAllUsers(): string[] {
    return Array.from(this.mappings.keys());
  }

  // Clear user wallets (for testing)
  clearUser(userIdentifier: string) {
    this.mappings.delete(userIdentifier);
    this.saveToFile();
  }

  // Export data (for backup)
  exportData(): WalletMapping[] {
    return Array.from(this.mappings.values());
  }

  // Import data (for restore)
  importData(data: WalletMapping[]) {
    data.forEach(mapping => {
      this.mappings.set(mapping.userIdentifier, mapping);
    });
    this.saveToFile();
  }
}

// Singleton instance
export const walletStorage = new WalletStorage();

// Helper functions
export function storeUserWalletData(
  userIdentifier: string, 
  authMethod: string, 
  evmData?: WalletData,
  solanaData?: WalletData
) {
  const wallets: WalletMapping['wallets'] = {};
  if (evmData) wallets.evm = evmData;
  if (solanaData) wallets.solana = solanaData;
  
  walletStorage.storeMapping(userIdentifier, authMethod, wallets);
}

export function getUserWalletData(userIdentifier: string): WalletMapping['wallets'] | null {
  const mapping = walletStorage.getMapping(userIdentifier);
  return mapping?.wallets || null;
}

export function hasUserWallets(userIdentifier: string): boolean {
  return walletStorage.hasWallets(userIdentifier);
}

// Get or wait for initialization lock
export async function getInitializationLock(userIdentifier: string): Promise<() => void> {
  // If there's an ongoing initialization, wait for it
  if (initializationLocks.has(userIdentifier)) {
    await initializationLocks.get(userIdentifier);
  }
  
  // Create a new lock
  let releaseLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  
  initializationLocks.set(userIdentifier, lockPromise);
  
  // Return the release function
  return () => {
    initializationLocks.delete(userIdentifier);
    releaseLock();
  };
}

// Legacy support - convert addresses to wallet format
export function getUserWallets(userIdentifier: string): { base: string | null; apechain: string | null; solana: string | null } | null {
  const mapping = walletStorage.getMapping(userIdentifier);
  if (!mapping?.wallets) return null;
  
  return {
    base: mapping.wallets.evm?.address || null,
    apechain: mapping.wallets.evm?.address || null, // Same as base
    solana: mapping.wallets.solana?.address || null
  };
}

// Store legacy format (for backward compatibility)
export function storeUserWallets(userIdentifier: string, authMethod: string, wallets: { base: string; apechain: string; solana: string }) {
  // This is called by existing code, we'll handle it in the updated privy-server-wallet.ts
  console.warn('⚠️ Using legacy storeUserWallets - wallet IDs will not be stored properly');
} 