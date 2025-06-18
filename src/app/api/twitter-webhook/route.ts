import { NextRequest, NextResponse } from 'next/server';
import { getEvmWalletProvider, getSolanaWalletProvider, exportEvmWalletInfo, exportSolanaWalletInfo } from '@/lib/privy-server-wallet';
import { storeUserWalletData, getUserWalletData } from '@/lib/wallet-storage-adapter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle Twitter mention webhook
    if (body.for_user_id && body.tweet_create_events) {
      for (const tweet of body.tweet_create_events) {
        const text = tweet.text;
        const mentionedUsers = tweet.entities?.user_mentions || [];
        
        // Check if this is a wallet request or send funds request
        if (text.toLowerCase().includes('wallet') || text.toLowerCase().includes('send')) {
          // Extract mentioned usernames (excluding our bot)
          const targetUsers = mentionedUsers
            .filter((user: any) => user.id_str !== body.for_user_id)
            .map((user: any) => user.screen_name);
          
          // Create wallets for mentioned users
          for (const username of targetUsers) {
            const userIdentifier = `twitter:${username}`;
            
            // Check if user already has wallets
            const existingWalletData = await getUserWalletData(userIdentifier);
            if (existingWalletData?.evm && existingWalletData?.solana) {
              console.log(`✅ User ${username} already has wallets`);
              continue;
            }
            
            try {
              // Create wallets for the user
              const [evmWallet, solanaWallet] = await Promise.all([
                getEvmWalletProvider(userIdentifier),
                getSolanaWalletProvider(userIdentifier)
              ]);
              
              // Get wallet info including IDs
              const [evmInfo, solanaInfo] = await Promise.all([
                exportEvmWalletInfo(evmWallet),
                exportSolanaWalletInfo(solanaWallet)
              ]);
              
              // Store complete wallet data with IDs
              storeUserWalletData(
                userIdentifier,
                'twitter-mention',
                { address: evmInfo.address, walletId: evmInfo.walletId },
                { address: solanaInfo.address, walletId: solanaInfo.walletId }
              );
              
              console.log(`✅ Created wallets for Twitter user @${username}`);
              console.log(`   EVM: ${evmInfo.address} (ID: ${evmInfo.walletId})`);
              console.log(`   Solana: ${solanaInfo.address} (ID: ${solanaInfo.walletId})`);
              
              // TODO: Reply to the tweet with wallet addresses
              // This would require Twitter API integration
              
            } catch (error) {
              console.error(`Error creating wallets for ${username}:`, error);
            }
          }
        }
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Twitter webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Endpoint to get wallet for a Twitter user
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    
    const userIdentifier = `twitter:${username}`;
    const walletData = await getUserWalletData(userIdentifier);
    
    if (!walletData?.evm || !walletData?.solana) {
      return NextResponse.json(
        { error: 'User has no wallets' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      username,
      wallets: {
        base: walletData.evm.address,
        apechain: walletData.evm.address, // Same as base
        solana: walletData.solana.address
      }
    });
  } catch (error) {
    console.error('Error retrieving Twitter user wallets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wallets' },
      { status: 500 }
    );
  }
} 