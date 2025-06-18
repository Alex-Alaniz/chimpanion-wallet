import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages, tool } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { determineChain, CHAIN_CONFIG } from '@/lib/multi-chain-wallet';
import { signAndExecuteTransaction } from '@/lib/server-transaction';
import { checkPremiumMembership, formatMembershipStatus } from '@/lib/membership-utils';
import { saveChatMessage, startChatSession } from '@/lib/chat-storage';
import { transactionManager, isConfirmationResponse } from '@/lib/transaction-manager';

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.',
          setup: 'Visit https://platform.openai.com/api-keys to get your API key'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages, userIdentifier, authMethod, sessionId: existingSessionId } = await req.json();
    console.log('Chat API called with:', { messagesCount: messages.length, userIdentifier, authMethod });

    // Check membership status - for now, we'll skip this until we implement the new subscription system
    let sessionId = existingSessionId;
    const userId = userIdentifier || 'anonymous';
    
    // Convert messages without modifying them
    const processedMessages = convertToCoreMessages(messages);

    // Check if the last message is a yes/no confirmation
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const confirmResponse = isConfirmationResponse(lastMessage.content);
        
        if (confirmResponse) {
          // Check for pending transaction
          const pendingTx = transactionManager.getUsersPendingTransaction(userId);
          
          if (pendingTx) {
            if (confirmResponse === 'yes') {
              // Confirm and execute transaction SERVER-SIDE
              transactionManager.confirmTransaction(pendingTx.id);
              
              // Execute the transaction server-side using userIdentifier
              const result = await signAndExecuteTransaction(
                userIdentifier,
                pendingTx.details.chain as 'base' | 'apechain' | 'solana',
                pendingTx.details.to || '',
                pendingTx.details.amount || '0',
                pendingTx.details.asset || '',
                userIdentifier // Use userIdentifier as the from address placeholder
              );
              
              // Clear the pending transaction
              transactionManager.clearPendingTransaction(userId);

              // Return immediate response for transaction execution
              const responseMessage = result.success 
                ? `✅ Transaction executed successfully!

🔐 **Signed using server wallet** (no popup required)

Chain: ${result.chain}
Transaction Hash: ${result.transactionHash}
From: ${result.from}
To: ${result.to}
Amount: ${result.amount} ${pendingTx.details.asset || ''}

[View on Explorer](${result.explorerUrl})

The transaction has been confirmed on-chain.`
                : `❌ Transaction failed: ${result.error}`;

              // Add the response as a message and continue with streaming
              const confirmationMessages = [
                ...processedMessages,
                {
                  role: 'assistant' as const,
                  content: responseMessage,
                }
              ];

              // Stream the response
              const confirmationResult = await streamText({
                model: openai('gpt-4o'),
                messages: confirmationMessages,
                maxTokens: 100,
                system: 'You are a helpful assistant. The transaction has been processed. Do not generate any additional content.'
              });

              const confirmResponse = confirmationResult.toDataStreamResponse({
                headers: {
                  'X-Transaction-Status': result.success ? 'completed' : 'failed',
                  'X-Transaction-Hash': result.transactionHash || '',
                  'X-Transaction-Chain': result.chain || '',
                  'X-Server-Signed': 'true',
                }
              });
              
              return confirmResponse;
            } else {
              // Reject transaction
              transactionManager.rejectTransaction(pendingTx.id);
              
              const rejectMessage = '❌ Transaction cancelled.';
              
              // Add the response as a message and continue with streaming
              const rejectionMessages = [
                ...processedMessages,
                {
                  role: 'assistant' as const,
                  content: rejectMessage,
                }
              ];

              // Stream the response
              const rejectionResult = await streamText({
                model: openai('gpt-4o'),
                messages: rejectionMessages,
                maxTokens: 100,
                system: 'You are a helpful assistant. The transaction has been cancelled. Do not generate any additional content.'
              });

              const rejectResponse = rejectionResult.toDataStreamResponse({
                headers: {
                  'X-Transaction-Status': 'cancelled',
                }
              });
              
              return rejectResponse;
            }
          }
        }
      }
    }

    try {
      const result = await streamText({
        model: openai('gpt-4o'),
        messages: processedMessages,
        maxSteps: 5,
        tools: {
          // Check authentication status
          checkAuthStatus: tool({
            description: 'Check user authentication status and connected accounts',
            parameters: z.object({}),
            execute: async () => {
              console.log('🔧 AI Tool called: checkAuthStatus');
              
              return {
                success: true,
                authenticated: !!userIdentifier,
                userIdentifier,
                authMethod,
                isTwitterUser: authMethod === 'twitter',
                displayName: authMethod === 'twitter' && userIdentifier?.startsWith('@') 
                  ? userIdentifier 
                  : userIdentifier || 'Not authenticated',
                message: userIdentifier 
                  ? `✅ Authenticated${authMethod === 'twitter' ? ' via 𝕏 (Twitter)' : ''} as ${userIdentifier}`
                  : '❌ Not authenticated',
                serverWalletInfo: userIdentifier 
                  ? 'Server wallets are created based on your authentication. Use showServerWallets to view addresses.'
                  : 'Authenticate to create server wallets',
              };
            },
          }),
          
          // Check subscription status tool
          checkSubscription: tool({
            description: 'Check if user has an active premium subscription',
            parameters: z.object({}),
            execute: async () => {
              console.log('🔧 AI Tool called: checkSubscription');
              
              if (!userIdentifier) {
                return {
                  success: false,
                  error: 'No user identified',
                };
              }
              
              const { checkPremiumSubscription, formatSubscriptionStatus, getSubscriptionBenefits } = await import('@/lib/membership-utils');
              const subscription = await checkPremiumSubscription(userIdentifier);
              
              return {
                success: true,
                subscription: {
                  status: subscription.status,
                  price: '$20/month',
                  benefits: getSubscriptionBenefits(),
                  expiresAt: subscription.expiresAt,
                  autoRenew: subscription.autoRenew,
                },
                message: formatSubscriptionStatus(subscription),
                isActive: subscription.status === 'active',
              };
            },
          }),
          
          // Subscribe to premium
          subscribePremium: tool({
            description: 'Get instructions to subscribe to premium membership',
            parameters: z.object({
              paymentMethod: z.enum(['APES', 'SOL', 'USDC']).optional().default('APES').describe('Payment method (APES for 30% discount!)'),
            }),
            execute: async ({ paymentMethod = 'APES' }) => {
              console.log('🔧 AI Tool called: subscribePremium with method:', paymentMethod);
              
              if (!userIdentifier) {
                return {
                  success: false,
                  error: 'No user identified',
                };
              }
              
              const { generatePaymentInstructions, getTreasuryWallet, getApesTokenInfo } = await import('@/lib/membership-utils');
              const instructions = generatePaymentInstructions(userIdentifier, paymentMethod);
              const apesInfo = getApesTokenInfo();
              
              return {
                success: true,
                paymentMethod,
                chain: 'solana', // Always Solana
                treasuryWallet: getTreasuryWallet('solana'),
                amount: instructions.amount,
                memo: instructions.memo,
                tokenAddress: instructions.tokenAddress,
                instructions: instructions.instructions,
                pricing: {
                  apes: `$${apesInfo.pricing.subscription} (Save ${apesInfo.pricing.discount}!)`,
                  standard: `$${apesInfo.pricing.standard}`,
                  savings: instructions.savings,
                },
                apesToken: {
                  address: apesInfo.address,
                  symbol: apesInfo.symbol,
                  solscanUrl: apesInfo.solscanUrl,
                },
                message: paymentMethod === 'APES' 
                  ? `🎉 Pay with APES and save 30%! Send ${instructions.amount} APES tokens to get premium for just $21/month`
                  : `Send ${instructions.amount} ${paymentMethod} to subscribe. Consider using APES to save $9!`,
              };
            },
          }),
          
          // Show server wallet addresses
          showServerWallets: tool({
            description: 'Show the server-controlled wallet addresses for this user',
            parameters: z.object({}),
            execute: async () => {
              console.log('🔧 AI Tool called: showServerWallets');
              
              if (!userIdentifier) {
                return {
                  success: false,
                  error: 'No user identified',
                };
              }
              
              try {
                const { getServerWalletAddresses } = await import('@/lib/privy-server-wallet');
                const serverAddresses = await getServerWalletAddresses(userIdentifier);
                
                return {
                  success: true,
                  userIdentifier,
                  serverWallets: serverAddresses,
                  message: 'These are your server-controlled wallets used for seamless transactions. They need to be funded to execute transactions.',
                  instructions: `To fund your wallets:
1. Copy the wallet address for the chain you want to use
2. Send funds from any external wallet or exchange
3. Once funded, you can execute transactions with simple Yes/No confirmations`,
                };
              } catch (error) {
                return {
                  success: false,
                  error: error instanceof Error ? error.message : 'Failed to get server wallets',
                };
              }
            },
          }),
          
          // Check server wallet balances
          checkServerBalances: tool({
            description: 'Check balances of server-controlled wallets',
            parameters: z.object({}),
            execute: async () => {
              console.log('🔧 AI Tool called: checkServerBalances');
              
              if (!userIdentifier) {
                return {
                  success: false,
                  error: 'No user identified',
                };
              }
              
              try {
                const { getServerWalletAddresses } = await import('@/lib/privy-server-wallet');
                const serverAddresses = await getServerWalletAddresses(userIdentifier);
                
                // Fetch balances for server wallets
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/wallet-balances`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    wallets: {
                      evm: serverAddresses.base || serverAddresses.apechain,
                      solana: serverAddresses.solana,
                    },
                  }),
                });

                if (!response.ok) {
                  throw new Error(`Failed to fetch balances: ${response.status}`);
                }

                const data = await response.json();
                return {
                  success: true,
                  balances: data.balances,
                  totalValue: data.totalValue,
                  serverWallets: serverAddresses,
                  timestamp: data.timestamp,
                };
              } catch (error) {
                console.error('❌ AI Tool error:', error);
                return {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                };
              }
            },
          }),
          
          // Multi-chain transaction tools using server wallets
          transferTokens: tool({
            description: 'Transfer tokens using server wallet on Base, ApeChain, or Solana',
            parameters: z.object({
              to: z.string().describe('Recipient address'),
              amount: z.string().describe('Amount to transfer'),
              asset: z.string().default('ETH').describe('Asset to transfer (ETH, APE, SOL, etc)'),
              chain: z.string().optional().describe('Specific chain to use (base, apechain, solana)'),
            }),
            execute: async ({ to, amount, asset, chain }) => {
              console.log('🔧 Preparing transfer:', { to, amount, asset, chain });
              
              if (!userIdentifier) {
                return {
                  success: false,
                  error: 'No user identified',
                };
              }
              
              try {
                const selectedChain = determineChain(asset, chain);
                
                // Create pending transaction for confirmation
                const pendingTx = transactionManager.createPendingTransaction(
                  userId,
                  'transfer',
                  {
                    from: userIdentifier, // This will be replaced with actual server wallet address
                    to,
                    amount,
                    asset,
                    chain: selectedChain,
                  },
                  {
                    platform: 'chat'
                  }
                );
                
                // Return confirmation request
                return {
                  success: true,
                  type: 'confirmation_required',
                  transactionId: pendingTx.id,
                  message: transactionManager.formatConfirmationMessage(pendingTx),
                  details: {
                    from: 'Server wallet',
                    to,
                    amount,
                    asset,
                    chain: selectedChain,
                  },
                  expiresIn: '5 minutes',
                  serverSigned: true,
                  note: 'This transaction will be signed by your secure server wallet',
                };
              } catch (error) {
                console.error('Transfer preparation error:', error);
                return {
                  success: false,
                  error: error instanceof Error ? error.message : 'Transfer preparation failed',
                };
              }
            },
          }),
          
          // Show supported chains
          showChains: tool({
            description: 'Show all supported blockchain networks',
            parameters: z.object({}),
            execute: async () => {
              return {
                success: true,
                chains: [
                  {
                    name: 'Base',
                    chainId: CHAIN_CONFIG.base.chainId,
                    nativeCurrency: CHAIN_CONFIG.base.nativeCurrency,
                    explorerUrl: CHAIN_CONFIG.base.explorerUrl,
                    description: 'Ethereum L2 - Low fees, fast transactions',
                  },
                  {
                    name: 'ApeChain', 
                    chainId: CHAIN_CONFIG.apechain.chainId,
                    nativeCurrency: CHAIN_CONFIG.apechain.nativeCurrency,
                    explorerUrl: CHAIN_CONFIG.apechain.explorerUrl,
                    description: 'Native APE token chain',
                  },
                  {
                    name: 'Solana',
                    nativeCurrency: CHAIN_CONFIG.solana.nativeCurrency,
                    explorerUrl: CHAIN_CONFIG.solana.explorerUrl,
                    description: 'High-speed blockchain',
                  },
                ],
                message: 'All chains are supported with server-side signing for seamless transactions',
              };
            },
          }),
        },
        system: `You are Chimpanion, a friendly AI blockchain companion that helps users with crypto and DeFi operations.

AUTHENTICATION: ${authMethod ? `User authenticated via ${authMethod}` : 'User not authenticated'}
USER: ${userIdentifier || 'Not provided'} ${authMethod === 'twitter' ? '(Twitter user)' : ''}

🔐 SERVER WALLET SYSTEM:
- Each user gets dedicated server wallets (one per chain)
- Created automatically when first needed
- All transactions signed server-side - NO popups or extensions needed!
- Simple Yes/No confirmations for all transactions
- Wallets are tied to your Twitter/email account

📋 AVAILABLE TOOLS:
- showServerWallets - Display your server wallet addresses
- checkServerBalances - Check balances across all chains
- transferTokens - Send crypto on any chain
- showChains - List all supported blockchains
- checkSubscription - View subscription status
- subscribePremium - Get payment instructions

⛓️ SUPPORTED CHAINS:
- Base (Ethereum L2) - Fast & cheap ETH/USDC transfers
- ApeChain - Native APE token ecosystem
- Solana - Lightning-fast SOL transactions

💳 PREMIUM SUBSCRIPTION:
- $21/month with PRIMEAPE (APES) tokens - SAVE 30%!
- $30/month with other payment methods (SOL, USDC, card)
- Extra $9 from non-APES payments goes to buying APES
- All payments go to Solana treasury wallet
- Benefits: Unlimited messages, 50% lower fees, priority support, advanced features
- Use subscribePremium to get payment instructions

🚀 GETTING STARTED:
1. First time? Use showServerWallets to see your addresses
2. Fund your server wallets from any exchange/wallet
3. Execute transactions with simple Yes/No confirmations
4. No wallet extensions or popups ever!

💡 TIPS:
- Twitter users: Your wallets are linked to @${userIdentifier?.startsWith('@') ? userIdentifier.slice(1) : userIdentifier}
- Server wallets are separate from any existing wallets you own
- Transactions are REAL and execute on mainnet
- Always double-check addresses before confirming

Be helpful, make blockchain simple, and guide users through their crypto journey!`,
        maxTokens: 2000,
        onFinish: async ({ text, usage }) => {
          // Save assistant message for premium members
          if (sessionId && userId !== 'anonymous') {
            await saveChatMessage(
              sessionId,
              'assistant',
              text,
              userId,
              { usage }
            );
          }
        },
      });

      console.log('✅ StreamText created successfully');
      
      // Add session ID to response headers if available
      const response = result.toDataStreamResponse();
      if (sessionId) {
        response.headers.set('X-Session-ID', sessionId);
      }
      
      console.log('📤 Sending stream response');
      return response;

    } catch (streamError) {
      console.error('Stream error:', streamError);
      throw streamError; // Re-throw to be caught by outer try-catch
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Determine error message
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or not configured properly';
        statusCode = 401;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 