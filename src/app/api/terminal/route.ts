import { NextRequest, NextResponse } from 'next/server';
import { parseBlockchainCommand, getAllBlockchainTools } from '@/lib/blockchain-tools';

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    console.log('Terminal command received:', command);

    // Parse the blockchain command
    const parsedCommand = parseBlockchainCommand(command);
    
    if (!parsedCommand) {
      return NextResponse.json({
        success: false,
        error: `Unknown command: "${command}"`,
        help: 'Try: "send 0.01 ETH to 0x123...", "swap 0.1 ETH for USDC", "deploy token MyToken MTK", or "help blockchain"',
      });
    }

    // Execute the command
    const tools = getAllBlockchainTools();
    let result;

    switch (parsedCommand.action) {
      case 'transfer':
        result = await tools.simulateTransfer.execute({
          to: parsedCommand.params.to,
          amount: parsedCommand.params.amount,
          asset: parsedCommand.params.asset,
        }, { toolCallId: 'terminal', messages: [] });
        break;

      case 'swap':
        result = await tools.simulateSwap.execute({
          fromAsset: parsedCommand.params.fromAsset,
          toAsset: parsedCommand.params.toAsset,
          amount: parsedCommand.params.amount,
        }, { toolCallId: 'terminal', messages: [] });
        break;

      case 'deployToken':
        result = await tools.simulateDeployToken.execute({
          name: parsedCommand.params.name,
          symbol: parsedCommand.params.symbol,
          totalSupply: parsedCommand.params.totalSupply,
        }, { toolCallId: 'terminal', messages: [] });
        break;

      case 'checkCapabilities':
        result = await tools.checkAgentCapabilities.execute({}, { toolCallId: 'terminal', messages: [] });
        break;

      case 'help':
        result = await tools.getBlockchainHelp.execute({
          topic: parsedCommand.params.topic,
        }, { toolCallId: 'terminal', messages: [] });
        break;

      default:
        result = {
          success: false,
          error: `Action not implemented: ${parsedCommand.action}`,
        };
    }

    return NextResponse.json({
      success: true,
      command: parsedCommand,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Terminal command error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process terminal command',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Terminal API - POST commands to execute blockchain operations',
    examples: [
      'send 0.01 ETH to 0x1234567890123456789012345678901234567890',
      'swap 0.1 ETH for USDC',
      'deploy token MyToken MTK 1000000',
      'help blockchain setup',
    ],
    note: 'These are simulations until CDP credentials are configured',
  });
} 