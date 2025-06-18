import { NextRequest, NextResponse } from 'next/server';
import { getAllWalletBalances, WalletBalance } from '@/lib/wallet-utils';

export async function POST(req: NextRequest) {
  try {
    const { wallets } = await req.json();

    if (!wallets || (!wallets.evm && !wallets.solana)) {
      return NextResponse.json(
        { error: 'No wallet addresses provided' },
        { status: 400 }
      );
    }

    // Fetch balances for all provided wallets
    const balances = await getAllWalletBalances({
      evm: wallets.evm,
      solana: wallets.solana,
    });

    // Calculate total portfolio value
    const totalValue = balances.reduce((sum, balance) => {
      return sum + parseFloat(balance.balanceUSD);
    }, 0);

    return NextResponse.json({
      balances,
      totalValue: totalValue.toFixed(2),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch wallet balances',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Support GET requests with query parameters for simpler AI tool integration
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evm');
  const solanaAddress = searchParams.get('solana');

  if (!evmAddress && !solanaAddress) {
    return NextResponse.json(
      { error: 'No wallet addresses provided in query parameters' },
      { status: 400 }
    );
  }

  try {
    const balances = await getAllWalletBalances({
      evm: evmAddress || undefined,
      solana: solanaAddress || undefined,
    });

    const totalValue = balances.reduce((sum, balance) => {
      return sum + parseFloat(balance.balanceUSD);
    }, 0);

    return NextResponse.json({
      balances,
      totalValue: totalValue.toFixed(2),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch wallet balances',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 