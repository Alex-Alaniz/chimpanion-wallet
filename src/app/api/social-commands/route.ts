import { NextRequest, NextResponse } from 'next/server';
import { parseCommand } from '@/lib/utils';
import { parseBlockchainCommand, getAllBlockchainTools } from '@/lib/blockchain-tools';

// This would be your Twitter webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (implement Twitter webhook verification)
    // const signature = request.headers.get('x-twitter-webhooks-signature');
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Handle different Twitter webhook events
    if (body.tweet_create_events) {
      for (const tweet of body.tweet_create_events) {
        await handleTweetMention(tweet);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing social command:', error);
    return NextResponse.json(
      { error: 'Failed to process social command' },
      { status: 500 }
    );
  }
}

async function handleTweetMention(tweet: any) {
  try {
    // Check if tweet mentions our handle
    const ourHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || 'ChimpanionApp';
    const mentionsUs = tweet.entities?.user_mentions?.some(
      (mention: any) => mention.screen_name.toLowerCase() === ourHandle.toLowerCase()
    );

    if (!mentionsUs) {
      return;
    }

    // Extract command from tweet text
    const tweetText = tweet.text || '';
    const commandText = extractCommandFromTweet(tweetText, ourHandle);
    
    if (!commandText) {
      await replyToTweet(
        tweet.id_str,
        "I didn't understand that command. Try 'balance', 'markets', or 'help' for available commands!"
      );
      return;
    }

    // First try to parse as blockchain command
    const blockchainCommand = parseBlockchainCommand(commandText);
    
    if (blockchainCommand) {
      const result = await executeBlockchainCommand(blockchainCommand);
      await replyToTweet(tweet.id_str, formatBlockchainResponse(result, tweet.user.screen_name));
      return;
    }

    // Fallback to regular social commands
    const { command, args } = parseCommand(commandText);
    const result = await executeSocialCommand(command, args, tweet.user);

    // Reply with result
    await replyToTweet(tweet.id_str, result);

  } catch (error) {
    console.error('Error handling tweet mention:', error);
    await replyToTweet(
      tweet.id_str,
      "Sorry, I encountered an error processing your command. Please try again later!"
    );
  }
}

function extractCommandFromTweet(tweetText: string, handle: string): string | null {
  // Remove @handle mention and extract command
  const mentionPattern = new RegExp(`@${handle}\\s*`, 'gi');
  const commandText = tweetText.replace(mentionPattern, '').trim();
  
  // Remove other mentions and URLs for cleaner command parsing
  const cleanText = commandText
    .replace(/@\w+/g, '') // Remove other mentions
    .replace(/https?:\/\/\S+/g, '') // Remove URLs
    .trim();

  return cleanText || null;
}

async function executeSocialCommand(command: string, args: string[], user: any): Promise<string> {
  // Note: In a real implementation, you'd need to:
  // 1. Authenticate the user (link Twitter account to wallet)
  // 2. Get their wallet address from the database
  // 3. Execute the actual blockchain commands
  
  const userName = user.screen_name;
  
  switch (command.toLowerCase()) {
    case 'balance':
      return `Hi @${userName}! Your wallet balance:
• ETH: 0.025 ($61.25)
• USDC: 150.00 ($150.00)
• Total: $211.25

Reply with "deposit" for funding instructions!`;

    case 'markets':
      return `Hi @${userName}! Hot prediction markets:
🔥 Bitcoin $100k by 2024? (1.8x Yes, 2.2x No)
🗳️ Trump 2024 election? (1.5x Yes, 2.5x No)
📱 Apple AR glasses 2024? (3.2x Yes, 1.3x No)

Reply "@ChimpanionApp bet market1 yes 50" to place a bet!`;

    case 'bet':
      if (args.length < 3) {
        return `@${userName} Usage: @ChimpanionApp bet <market> <outcome> <amount>
Example: @ChimpanionApp bet bitcoin yes 100`;
      }
      return `@${userName} Bet placed! 
Market: ${args[0]}
Outcome: ${args[1]}
Amount: ${args[2]} USDC
Odds: 1.8x
Potential payout: ${parseInt(args[2]) * 1.8} USDC
Status: Pending confirmation ⏳`;

    case 'bets':
      return `@${userName} Your recent bets:
✅ Trump 2024 - Yes - 50 USDC - Won (+75 USDC)
⏳ Bitcoin $100k - Yes - 100 USDC - Pending
❌ Apple AR - Yes - 25 USDC - Lost

Total P&L: +50 USDC 📈`;

    case 'help':
      return `@${userName} Chimpanion Commands:
• balance - Check wallet balance
• markets - View prediction markets  
• bet <market> <outcome> <amount> - Place bet
• bets - View betting history
• deposit - Get funding instructions
• withdraw <amount> <address> - Withdraw funds

Just mention @ChimpanionApp with your command!`;

    case 'deposit':
      return `@${userName} To deposit funds:
Send tokens to: 0x1234...5678
Supported: ETH, USDC (Base network)
⚠️ Only use Base network!

Need testnet funds? Reply "faucet" 💧`;

    case 'withdraw':
      if (args.length < 2) {
        return `@${userName} Usage: @ChimpanionApp withdraw <amount> <address>
Example: @ChimpanionApp withdraw 100 0x1234...5678`;
      }
      return `@${userName} Withdrawal initiated!
Amount: ${args[0]} USDC
To: ${args[1]}
Status: Pending confirmation ⏳
Tx will appear in your DMs when complete.`;

    case 'faucet':
      return `@${userName} Testnet funds sent! 🚰
• 0.1 ETH
• 1000 USDC
• Network: Base Sepolia

Check your balance with "@ChimpanionApp balance"`;

    default:
      return `@${userName} Unknown command: "${command}"
Try "@ChimpanionApp help" for available commands!`;
  }
}

async function replyToTweet(tweetId: string, message: string): Promise<void> {
  // Implementation would use Twitter API v2 to reply to tweets
  // This requires Twitter API credentials and proper authentication
  
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        reply: {
          in_reply_to_tweet_id: tweetId
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    console.log('Successfully replied to tweet:', tweetId);
  } catch (error) {
    console.error('Failed to reply to tweet:', error);
    // In production, you might want to queue failed replies for retry
  }
}

// Execute blockchain commands for Twitter
async function executeBlockchainCommand(command: any): Promise<any> {
  const tools = getAllBlockchainTools();
  
  switch (command.action) {
    case 'transfer':
      return await tools.simulateTransfer.execute({
        to: command.params.to,
        amount: command.params.amount,
        asset: command.params.asset,
      }, { toolCallId: 'twitter', messages: [] });
      
    case 'swap':
      return await tools.simulateSwap.execute({
        fromAsset: command.params.fromAsset,
        toAsset: command.params.toAsset,
        amount: command.params.amount,
      }, { toolCallId: 'twitter', messages: [] });
      
    case 'deployToken':
      return await tools.simulateDeployToken.execute({
        name: command.params.name,
        symbol: command.params.symbol,
        totalSupply: command.params.totalSupply,
      }, { toolCallId: 'twitter', messages: [] });
      
    case 'checkCapabilities':
      return await tools.checkAgentCapabilities.execute({}, { toolCallId: 'twitter', messages: [] });
      
    case 'help':
      return await tools.getBlockchainHelp.execute({
        topic: command.params.topic,
      }, { toolCallId: 'twitter', messages: [] });
      
    default:
      return {
        success: false,
        error: `Unknown blockchain command: ${command.action}`,
      };
  }
}

// Format blockchain responses for Twitter
function formatBlockchainResponse(result: any, username: string): string {
  if (!result.success) {
    return `@${username} ❌ Error: ${result.error}`;
  }

  if (result.simulation) {
    const lines = [
      `@${username} ${result.message} ✨`,
      '',
      '📋 Details:',
    ];
    
    if (result.details.to) {
      lines.push(`• To: ${result.details.to}`);
    }
    if (result.details.amount) {
      lines.push(`• Amount: ${result.details.amount} ${result.details.asset || ''}`);
    }
    if (result.details.fromAsset && result.details.toAsset) {
      lines.push(`• Swap: ${result.details.amount} ${result.details.fromAsset} → ${result.details.estimatedOutput} ${result.details.toAsset}`);
    }
    if (result.details.name && result.details.symbol) {
      lines.push(`• Token: ${result.details.name} (${result.details.symbol})`);
      lines.push(`• Supply: ${result.details.totalSupply}`);
    }
    
    lines.push('');
    lines.push('⚠️ This is a simulation');
    lines.push('For real transactions, DM for setup info!');
    
    return lines.join('\n');
  }

  if (result.capabilities) {
    return `@${username} 🤖 Chimpanion Capabilities:
${result.capabilities.slice(0, 3).map((c: string) => `• ${c}`).join('\n')}

Status: ${result.status === 'configured' ? '✅ Ready' : '⚠️ Setup needed'}

Reply "help blockchain setup" for configuration info!`;
  }

  if (result.help) {
    return `@${username} 📚 ${result.topic}:

${result.help}

Need more help? DM us! 🚀`;
  }

  return `@${username} ✅ Operation completed successfully!`;
}

// Webhook verification function (implement based on Twitter's requirements)
function verifySignature(payload: any, signature: string | null): boolean {
  // Implement Twitter webhook signature verification
  // This involves HMAC SHA-256 verification using your webhook secret
  return true; // Placeholder - implement proper verification
} 