import { NextRequest, NextResponse } from 'next/server';
import { getEvmWalletProvider, getSolanaWalletProvider, getServerWalletAddresses, exportEvmWalletInfo, exportSolanaWalletInfo } from '@/lib/privy-server-wallet';
import { storeUserWalletData, getUserWalletData, getUserWallets, getInitializationLock } from '@/lib/wallet-storage-adapter';

export async function POST(req: NextRequest) {
  try {
    const { userIdentifier, authMethod } = await req.json();
    
    if (!userIdentifier) {
      return NextResponse.json({ error: 'User identifier required' }, { status: 400 });
    }

    console.log(`🔐 Initializing server wallets for user: ${userIdentifier} (${authMethod})`);

    // Get initialization lock to prevent concurrent wallet creation
    const releaseLock = await getInitializationLock(userIdentifier);
    
    try {
      // Check if user already has wallets stored with IDs
      const existingWalletData = await getUserWalletData(userIdentifier);
      if (existingWalletData?.evm && existingWalletData?.solana) {
        console.log('✅ Using existing wallets with stored IDs');
        const wallets = await getUserWallets(userIdentifier);
        if (wallets) {
          return NextResponse.json({
            success: true,
            wallets,
            cached: true,
            message: 'Using persistent wallets'
          });
        }
      }

      // Initialize wallets - only one EVM wallet and one Solana wallet
      // The wallet providers will check for existing wallet IDs internally
      const [evmWallet, solanaWallet] = await Promise.all([
        getEvmWalletProvider(userIdentifier), // Will reuse existing if stored
        getSolanaWalletProvider(userIdentifier) // Will reuse existing if stored
      ]);

      // Get wallet info including IDs
      const [evmInfo, solanaInfo] = await Promise.all([
        exportEvmWalletInfo(evmWallet),
        exportSolanaWalletInfo(solanaWallet)
      ]);
      
      // Store complete wallet data with IDs
      storeUserWalletData(
        userIdentifier,
        authMethod,
        { address: evmInfo.address, walletId: evmInfo.walletId },
        { address: solanaInfo.address, walletId: solanaInfo.walletId }
      );
      
      const wallets = {
        base: evmInfo.address,
        apechain: evmInfo.address, // Same address as base
        solana: solanaInfo.address
      };

      console.log('✅ Wallets initialized and stored with IDs');
      console.log(`   EVM: ${evmInfo.address} (ID: ${evmInfo.walletId})`);
      console.log(`   Solana: ${solanaInfo.address} (ID: ${solanaInfo.walletId})`);

      return NextResponse.json({
        success: true,
        wallets,
        cached: false,
        message: 'Wallets initialized successfully'
      });
    } finally {
      // Always release the lock
      releaseLock();
    }
  } catch (error) {
    console.error('Error initializing wallets:', error);
    return NextResponse.json(
      { error: 'Failed to initialize wallets' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve wallet addresses
export async function GET(req: NextRequest) {
  try {
    const userIdentifier = req.nextUrl.searchParams.get('userIdentifier');
    
    if (!userIdentifier) {
      return NextResponse.json({ error: 'User identifier required' }, { status: 400 });
    }

    // Check stored wallets with IDs
    const walletData = await getUserWalletData(userIdentifier);
    if (walletData?.evm && walletData?.solana) {
      const wallets = {
        base: walletData.evm.address,
        apechain: walletData.evm.address, // Same as base
        solana: walletData.solana.address
      };
      
      return NextResponse.json({
        success: true,
        wallets,
        cached: true,
        hasWalletIds: true
      });
    }

    // Fallback to checking server wallet addresses
    const walletAddresses = await getServerWalletAddresses(userIdentifier);
    
    return NextResponse.json({
      success: true,
      wallets: walletAddresses,
      cached: false,
      hasWalletIds: false
    });
  } catch (error) {
    console.error('Error retrieving wallets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wallets' },
      { status: 500 }
    );
  }
} 