import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Chain configurations
export const CHAIN_CONFIG = {
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  },
  apechain: {
    chainId: 33139,
    name: 'ApeChain',
    rpcUrl: 'https://apechain.calderachain.xyz/http',
    explorerUrl: 'https://apescan.io',
    nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  },
  solana: {
    name: 'Solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  },
};

// Get provider for EVM chains
export function getEvmProvider(chain: 'base' | 'apechain') {
  const config = CHAIN_CONFIG[chain];
  return new ethers.JsonRpcProvider(config.rpcUrl);
}

// Get Solana connection
export function getSolanaConnection() {
  return new Connection(CHAIN_CONFIG.solana.rpcUrl, 'confirmed');
}

// Prepare EVM transaction for signing
export async function prepareEvmTransaction(
  chain: 'base' | 'apechain',
  to: string,
  amount: string,
  userAddress: string
) {
  const provider = getEvmProvider(chain);
  const config = CHAIN_CONFIG[chain];
  
  // Check user's balance
  const balance = await provider.getBalance(userAddress);
  const amountWei = ethers.parseEther(amount);
  
  if (balance < amountWei) {
    throw new Error(`Insufficient ${config.nativeCurrency.symbol} balance on ${config.name}`);
  }
  
  // Get gas price and estimate gas
  const feeData = await provider.getFeeData();
  const gasLimit = await provider.estimateGas({
    from: userAddress,
    to,
    value: amountWei,
  });
  
  // Create transaction object for signing
  const nonce = await provider.getTransactionCount(userAddress);
  const transaction = {
    from: userAddress,
    to,
    value: amountWei.toString(),
    chainId: config.chainId,
    nonce,
    gasLimit: gasLimit.toString(),
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    type: 2, // EIP-1559 transaction
  };
  
  return {
    success: true,
    signingRequired: true,
    chain: config.name,
    from: userAddress,
    to,
    amount,
    symbol: config.nativeCurrency.symbol,
    transaction,
    message: `Transaction prepared. Ready for signing.`,
  };
}

// Prepare Solana transaction for signing
export async function prepareSolanaTransaction(
  to: string,
  amount: string,
  userAddress: string
) {
  const connection = getSolanaConnection();
  const fromPubkey = new PublicKey(userAddress);
  const toPubkey = new PublicKey(to);
  
  // Check balance
  const balance = await connection.getBalance(fromPubkey);
  const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
  
  if (balance < lamports) {
    throw new Error('Insufficient SOL balance');
  }
  
  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    })
  );
  
  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;
  
  // Serialize transaction for signing
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  }).toString('base64');
  
  return {
    success: true,
    signingRequired: true,
    chain: 'Solana',
    from: userAddress,
    to,
    amount,
    symbol: 'SOL',
    transaction: {
      serializedTransaction,
      blockhash,
      lastValidBlockHeight,
    },
    message: 'Transaction prepared. Ready for signing.',
  };
}

// Execute signed EVM transaction
export async function executeSignedEvmTransaction(
  chain: 'base' | 'apechain',
  signedTransaction: string
) {
  const provider = getEvmProvider(chain);
  const config = CHAIN_CONFIG[chain];
  
  try {
    const txResponse = await provider.broadcastTransaction(signedTransaction);
    const receipt = await txResponse.wait();
    
    return {
      success: true,
      chain: config.name,
      transactionHash: receipt?.hash,
      explorerUrl: `${config.explorerUrl}/tx/${receipt?.hash}`,
      message: `Transaction confirmed on ${config.name}`,
    };
  } catch (error) {
    throw new Error(`Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Execute signed Solana transaction
export async function executeSignedSolanaTransaction(
  signedTransaction: string
) {
  const connection = getSolanaConnection();
  
  try {
    // Deserialize and send transaction
    const txBuffer = Buffer.from(signedTransaction, 'base64');
    const signature = await connection.sendRawTransaction(txBuffer);
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    return {
      success: true,
      chain: 'Solana',
      transactionHash: signature,
      explorerUrl: `${CHAIN_CONFIG.solana.explorerUrl}/tx/${signature}`,
      message: 'Transaction confirmed on Solana',
    };
  } catch (error) {
    throw new Error(`Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Updated execute functions that prepare transactions for signing
export async function executeEvmTransaction(
  chain: 'base' | 'apechain',
  to: string,
  amount: string,
  userAddress: string
) {
  return prepareEvmTransaction(chain, to, amount, userAddress);
}

export async function executeSolanaTransaction(
  to: string,
  amount: string,
  userAddress: string
) {
  return prepareSolanaTransaction(to, amount, userAddress);
}

// Helper to determine which chain to use based on context
export function determineChain(
  asset: string,
  preferredChain?: string
): 'base' | 'apechain' | 'solana' {
  // If chain is specified, use it
  if (preferredChain) {
    return preferredChain.toLowerCase() as any;
  }
  
  // Otherwise, determine by asset
  switch (asset.toUpperCase()) {
    case 'SOL':
      return 'solana';
    case 'APE':
      return 'apechain';
    case 'ETH':
    case 'USDC':
    default:
      return 'base';
  }
} 