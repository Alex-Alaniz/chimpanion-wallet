// Server-side transaction execution using Privy server wallets
import { ethers } from 'ethers';
import { CHAIN_CONFIG } from './multi-chain-wallet';
import { getEvmWalletProvider, getSolanaWalletProvider } from './privy-server-wallet';
import { VersionedTransaction, Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionMessage } from '@solana/web3.js';

// Server-side transaction execution for EVM chains
export async function executeEvmTransactionServerSide(
  chain: 'base' | 'apechain',
  to: string,
  amount: string,
  fromAddress: string,
  userWalletAddress: string
) {
  try {
    const config = CHAIN_CONFIG[chain];
    
    // Get the single server-controlled EVM wallet for this user
    // This wallet works on all EVM chains
    const walletProvider = await getEvmWalletProvider(userWalletAddress);
    const serverWalletAddress = walletProvider.getAddress();
    
    console.log(`🔐 Using server wallet ${serverWalletAddress} for user wallet ${userWalletAddress}`);
    console.log(`   Executing on ${config.name} chain`);
    
    // Use the wallet provider's transfer method
    // Ensure the address is in the correct format
    const toAddress = to.startsWith('0x') ? to as `0x${string}` : `0x${to}` as `0x${string}`;
    const result = await walletProvider.nativeTransfer(toAddress, amount);
    
    return {
      success: true,
      chain: config.name,
      transactionHash: result,
      explorerUrl: `${config.explorerUrl}/tx/${result}`,
      from: serverWalletAddress,
      to,
      amount,
      message: `Transaction confirmed on ${config.name}`,
    };
  } catch (error) {
    console.error('Error executing EVM transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

// Server-side transaction execution for Solana
export async function executeSolanaTransactionServerSide(
  to: string,
  amount: string,
  fromAddress: string,
  userWalletAddress: string
) {
  try {
    // Get the server-controlled wallet for this user
    const walletProvider = await getSolanaWalletProvider(userWalletAddress);
    const serverWalletAddress = walletProvider.getAddress();
    
    console.log(`🔐 Using server wallet ${serverWalletAddress} for user wallet ${userWalletAddress}`);
    
    // Convert amount to string (SOL amount)
    const amountStr = amount;
    
    // Use the wallet provider's transfer method
    const signature = await walletProvider.nativeTransfer(to, amountStr);
    
    return {
      success: true,
      chain: 'Solana',
      transactionHash: signature,
      explorerUrl: `${CHAIN_CONFIG.solana.explorerUrl}/tx/${signature}`,
      from: serverWalletAddress,
      to,
      amount,
      message: 'Transaction confirmed on Solana',
    };
  } catch (error) {
    console.error('Error executing Solana transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

// Main transaction signing and execution function
export async function signAndExecuteTransaction(
  userWalletAddress: string,
  chain: 'base' | 'apechain' | 'solana',
  to: string,
  amount: string,
  asset: string,
  fromAddress: string
) {
  console.log(`💰 Executing ${asset} transfer on ${chain}:`, {
    to,
    amount,
    userWalletAddress,
    userWallet: fromAddress,
  });

  // Route to appropriate chain handler
  if (chain === 'solana') {
    return executeSolanaTransactionServerSide(to, amount, fromAddress, userWalletAddress);
  } else {
    return executeEvmTransactionServerSide(chain, to, amount, fromAddress, userWalletAddress);
  }
} 