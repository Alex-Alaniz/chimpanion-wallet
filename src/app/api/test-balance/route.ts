import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'mainnet';

  if (!address) {
    return NextResponse.json({ error: 'Address parameter required' }, { status: 400 });
  }

  try {
    // Test Solana connection
    const solanaRpc = network === 'devnet' 
      ? 'https://api.devnet.solana.com'
      : 'https://solana-mainnet.g.alchemy.com/v2/LB4s_CFb80irvbKFWL6qN';
      
    console.log(`Testing Solana balance on ${network}:`, solanaRpc);
    
    const connection = new Connection(solanaRpc, 'confirmed');
    
    // Test connection health
    const slot = await connection.getSlot();
    console.log('Current slot:', slot);
    
    // Test balance fetch
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(6);
    
    console.log('Balance result:', {
      address,
      lamports: balance,
      sol: solBalance,
      network,
      rpc: solanaRpc
    });

    return NextResponse.json({
      success: true,
      address,
      network,
      rpc: solanaRpc,
      currentSlot: slot,
      balance: {
        lamports: balance,
        sol: solBalance
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test balance error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      address,
      network,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 