// Production database adapter for wallet storage
import { Pool } from 'pg';
import { WalletData } from '../wallet-storage';

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection
export function initializeDatabase() {
  // Support both DATABASE_URL and POSTGRES_URL (Supabase uses POSTGRES_URL)
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    pool.on('error', (err: Error) => {
      console.error('Unexpected database error:', err);
    });
    
    console.log('🗄️ Database connection pool initialized');
  }
}

// Database operations
export const dbOperations = {
  // Store or update user wallet data
  async storeUserWallets(
    userIdentifier: string,
    authMethod: string,
    evmData?: WalletData,
    solanaData?: WalletData
  ): Promise<void> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO user_wallets (
        user_identifier, auth_method, 
        evm_address, evm_wallet_id,
        solana_address, solana_wallet_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_identifier) 
      DO UPDATE SET
        auth_method = EXCLUDED.auth_method,
        evm_address = COALESCE(EXCLUDED.evm_address, user_wallets.evm_address),
        evm_wallet_id = COALESCE(EXCLUDED.evm_wallet_id, user_wallets.evm_wallet_id),
        solana_address = COALESCE(EXCLUDED.solana_address, user_wallets.solana_address),
        solana_wallet_id = COALESCE(EXCLUDED.solana_wallet_id, user_wallets.solana_wallet_id),
        last_accessed = CURRENT_TIMESTAMP
    `;
    
    await pool.query(query, [
      userIdentifier,
      authMethod,
      evmData?.address || null,
      evmData?.walletId || null,
      solanaData?.address || null,
      solanaData?.walletId || null
    ]);
  },

  // Get user wallet data
  async getUserWallets(userIdentifier: string): Promise<{
    evm?: WalletData;
    solana?: WalletData;
  } | null> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = `
      SELECT 
        evm_address, evm_wallet_id,
        solana_address, solana_wallet_id
      FROM user_wallets
      WHERE user_identifier = $1
    `;
    
    const result = await pool.query(query, [userIdentifier]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    const wallets: { evm?: WalletData; solana?: WalletData } = {};
    
    if (row.evm_address && row.evm_wallet_id) {
      wallets.evm = {
        address: row.evm_address,
        walletId: row.evm_wallet_id
      };
    }
    
    if (row.solana_address && row.solana_wallet_id) {
      wallets.solana = {
        address: row.solana_address,
        walletId: row.solana_wallet_id
      };
    }
    
    // Update last_accessed
    await pool.query(
      'UPDATE user_wallets SET last_accessed = CURRENT_TIMESTAMP WHERE user_identifier = $1',
      [userIdentifier]
    );
    
    return wallets;
  },

  // Check if user has wallets
  async hasUserWallets(userIdentifier: string): Promise<boolean> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = 'SELECT 1 FROM user_wallets WHERE user_identifier = $1';
    const result = await pool.query(query, [userIdentifier]);
    
    return result.rows.length > 0;
  },

  // Store transaction record
  async storeTransaction(transaction: {
    userIdentifier: string;
    chain: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    tokenSymbol?: string;
    transactionHash?: string;
    status?: string;
  }): Promise<void> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO wallet_transactions (
        user_identifier, chain, from_address, to_address, 
        amount, token_symbol, transaction_hash, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await pool.query(query, [
      transaction.userIdentifier,
      transaction.chain,
      transaction.fromAddress,
      transaction.toAddress,
      transaction.amount,
      transaction.tokenSymbol || null,
      transaction.transactionHash || null,
      transaction.status || 'pending'
    ]);
  },

  // Update transaction status
  async updateTransactionStatus(
    transactionHash: string, 
    status: string,
    confirmedAt?: Date
  ): Promise<void> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = confirmedAt
      ? 'UPDATE wallet_transactions SET status = $1, confirmed_at = $2 WHERE transaction_hash = $3'
      : 'UPDATE wallet_transactions SET status = $1 WHERE transaction_hash = $2';
    
    const params = confirmedAt
      ? [status, confirmedAt, transactionHash]
      : [status, transactionHash];
    
    await pool.query(query, params);
  },

  // Store subscription
  async storeSubscription(subscription: {
    userIdentifier: string;
    subscriptionType: string;
    paymentMethod?: string;
    amount?: number;
    currency?: string;
    expiresAt?: Date;
  }): Promise<void> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO user_subscriptions (
        user_identifier, subscription_type, payment_method,
        amount, currency, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_identifier)
      DO UPDATE SET
        subscription_type = EXCLUDED.subscription_type,
        payment_method = EXCLUDED.payment_method,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        expires_at = EXCLUDED.expires_at,
        status = 'active'
    `;
    
    await pool.query(query, [
      subscription.userIdentifier,
      subscription.subscriptionType,
      subscription.paymentMethod || null,
      subscription.amount || null,
      subscription.currency || 'USD',
      subscription.expiresAt || null
    ]);
  },

  // Get subscription status
  async getSubscription(userIdentifier: string): Promise<any> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = `
      SELECT * FROM user_subscriptions 
      WHERE user_identifier = $1 AND status = 'active'
    `;
    
    const result = await pool.query(query, [userIdentifier]);
    return result.rows[0] || null;
  },

  // Cleanup old sessions
  async cleanupOldSessions(daysOld: number = 30): Promise<void> {
    if (!pool) throw new Error('Database not initialized');
    
    const query = `
      DELETE FROM chat_sessions 
      WHERE last_message_at < NOW() - INTERVAL '${daysOld} days'
    `;
    
    await pool.query(query);
  }
};

// Initialize on module load
if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
  initializeDatabase();
} 