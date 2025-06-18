import { randomUUID } from 'crypto';

export interface PendingTransaction {
  id: string;
  userId: string;
  type: 'transfer' | 'swap' | 'deploy';
  details: {
    from: string;
    to?: string;
    amount?: string;
    asset?: string;
    chain: string;
    estimatedGas?: string;
  };
  status: 'pending_confirmation' | 'confirmed' | 'rejected' | 'executed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
  messageContext?: {
    platform: 'chat' | 'twitter';
    messageId?: string;
    tweetId?: string;
  };
}

class TransactionManager {
  private pendingTransactions: Map<string, PendingTransaction> = new Map();
  private userTransactions: Map<string, string[]> = new Map();

  createPendingTransaction(
    userId: string,
    type: PendingTransaction['type'],
    details: PendingTransaction['details'],
    messageContext?: PendingTransaction['messageContext']
  ): PendingTransaction {
    const transaction: PendingTransaction = {
      id: randomUUID(),
      userId,
      type,
      details,
      status: 'pending_confirmation',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      messageContext
    };

    this.pendingTransactions.set(transaction.id, transaction);
    
    // Track user's transactions
    const userTxIds = this.userTransactions.get(userId) || [];
    userTxIds.push(transaction.id);
    this.userTransactions.set(userId, userTxIds);

    return transaction;
  }

  getPendingTransaction(transactionId: string): PendingTransaction | null {
    const tx = this.pendingTransactions.get(transactionId);
    
    if (!tx) return null;
    
    // Check if expired
    if (tx.expiresAt < new Date()) {
      tx.status = 'rejected';
      return tx;
    }
    
    return tx;
  }

  getUsersPendingTransaction(userId: string): PendingTransaction | null {
    const userTxIds = this.userTransactions.get(userId) || [];
    
    // Find the most recent pending transaction
    for (let i = userTxIds.length - 1; i >= 0; i--) {
      const tx = this.getPendingTransaction(userTxIds[i]);
      if (tx && tx.status === 'pending_confirmation') {
        return tx;
      }
    }
    
    return null;
  }

  confirmTransaction(transactionId: string): PendingTransaction | null {
    const tx = this.pendingTransactions.get(transactionId);
    if (!tx || tx.status !== 'pending_confirmation') return null;
    
    tx.status = 'confirmed';
    return tx;
  }

  rejectTransaction(transactionId: string): PendingTransaction | null {
    const tx = this.pendingTransactions.get(transactionId);
    if (!tx || tx.status !== 'pending_confirmation') return null;
    
    tx.status = 'rejected';
    return tx;
  }

  markExecuted(transactionId: string): void {
    const tx = this.pendingTransactions.get(transactionId);
    if (tx) {
      tx.status = 'executed';
    }
  }

  clearPendingTransaction(userId: string): void {
    const userTxIds = this.userTransactions.get(userId) || [];
    
    // Find and clear the most recent pending transaction
    for (let i = userTxIds.length - 1; i >= 0; i--) {
      const tx = this.pendingTransactions.get(userTxIds[i]);
      if (tx && tx.status === 'pending_confirmation') {
        this.pendingTransactions.delete(userTxIds[i]);
        break;
      }
    }
  }

  cleanupExpired(): number {
    let cleaned = 0;
    const now = new Date();
    
    for (const [id, tx] of this.pendingTransactions) {
      if (tx.expiresAt < now && tx.status === 'pending_confirmation') {
        tx.status = 'rejected';
        cleaned++;
      }
    }
    
    return cleaned;
  }

  formatConfirmationMessage(tx: PendingTransaction): string {
    const { type, details } = tx;
    
    switch (type) {
      case 'transfer':
        return `🔐 Confirm Transaction:\n\nSend ${details.amount} ${details.asset} to ${details.to}\nFrom: ${details.from.slice(0, 6)}...${details.from.slice(-4)}\nChain: ${details.chain}\n\nReply "Yes" to confirm or "No" to cancel.`;
      
      case 'swap':
        return `🔄 Confirm Swap:\n\nSwap ${details.amount} ${details.asset} for ${details.to}\nChain: ${details.chain}\n\nReply "Yes" to confirm or "No" to cancel.`;
      
      case 'deploy':
        return `🚀 Confirm Contract Deployment:\n\nDeploy ${details.asset} token\nChain: ${details.chain}\n\nReply "Yes" to confirm or "No" to cancel.`;
      
      default:
        return `Confirm transaction. Reply "Yes" or "No".`;
    }
  }
}

export const transactionManager = new TransactionManager();

// Helper to check if a message is a confirmation response
export function isConfirmationResponse(message: string): 'yes' | 'no' | null {
  const normalized = message.toLowerCase().trim();
  
  const yesVariants = ['yes', 'y', 'confirm', 'approve', '✅', 'yeah', 'yep', 'sure'];
  const noVariants = ['no', 'n', 'cancel', 'reject', '❌', 'nope', 'nah'];
  
  if (yesVariants.includes(normalized)) return 'yes';
  if (noVariants.includes(normalized)) return 'no';
  
  return null;
} 