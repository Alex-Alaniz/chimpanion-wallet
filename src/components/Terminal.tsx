'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal as TerminalIcon, Send } from 'lucide-react';
import { parseCommand } from '@/lib/utils';
import { AVAILABLE_COMMANDS } from '@/types';

interface CommandEntry {
  id: string;
  input: string;
  output: string;
  timestamp: Date;
  success: boolean;
}

export function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([
    {
      id: '1',
      input: 'help',
      output: `Welcome to Chimpanion Terminal! Here are the available commands:

• balance [chain] [token] - Check wallet balance
• deposit <amount> <token> [chain] - Deposit tokens
• withdraw <amount> <token> <address> [chain] - Withdraw tokens
• markets [category] - List prediction markets
• bet <marketId> <outcome> <amount> [token] - Place a bet
• bets [status] - View your betting history
• claim <betId> - Claim winnings
• help [command] - Show help

Type a command to get started!`,
      timestamp: new Date(),
      success: true
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async () => {
    if (!input.trim() || isProcessing) return;

    const { command, args } = parseCommand(input);
    const newEntry: CommandEntry = {
      id: Date.now().toString(),
      input: input.trim(),
      output: '',
      timestamp: new Date(),
      success: false
    };

    setHistory(prev => [...prev, newEntry]);
    setInput('');
    setIsProcessing(true);

    try {
      // Simulate command processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let output = '';
      let success = true;

      switch (command) {
        case 'balance':
          output = `Balance for Base network:
• ETH: 0.025 ($247.50)
• USDC: 150.00 ($150.00)
• Total: $397.50`;
          break;

        case 'markets':
          output = `Available prediction markets:
1. Will Bitcoin reach $100k by end of 2024? (Tech)
   - Yes: 1.8x odds
   - No: 2.2x odds
   
2. Will Trump win 2024 election? (Politics)
   - Yes: 1.5x odds
   - No: 2.5x odds`;
          break;

        case 'bet':
          if (args.length < 3) {
            output = 'Usage: bet <marketId> <outcome> <amount> [token]';
            success = false;
          } else {
            output = `Bet placed successfully!
Market: ${args[0]}
Outcome: ${args[1]}
Amount: ${args[2]} ${args[3] || 'USDC'}
Status: Pending confirmation`;
          }
          break;

        case 'bets':
          output = `Your betting history:
1. Bitcoin $100k by 2024 - Yes - 100 USDC - Pending
2. Trump 2024 election - Yes - 50 USDC - Won (+75 USDC)`;
          break;

        case 'deposit':
          if (args.length < 2) {
            output = 'Usage: deposit <amount> <token> [chain]';
            success = false;
          } else {
            output = `Deposit Instructions:
Send ${args[0]} ${args[1]} to your wallet address:
0x1234...5678

Network: ${args[2] || 'Base'}
⚠️ Make sure to use the correct network!`;
          }
          break;

        case 'withdraw':
          if (args.length < 3) {
            output = 'Usage: withdraw <amount> <token> <address> [chain]';
            success = false;
          } else {
            output = `Withdrawal initiated:
Amount: ${args[0]} ${args[1]}
To: ${args[2]}
Network: ${args[3] || 'Base'}
Status: Pending confirmation`;
          }
          break;

        case 'help':
          const helpCommand = args[0];
          if (helpCommand) {
            const cmd = AVAILABLE_COMMANDS.find(c => c.command === helpCommand);
            if (cmd) {
              output = `${cmd.command} - ${cmd.description}

Usage: ${cmd.command} ${cmd.args.join(' ')}

Examples:
${cmd.examples.map(ex => `  ${ex}`).join('\n')}`;
            } else {
              output = `Unknown command: ${helpCommand}. Type 'help' to see all commands.`;
              success = false;
            }
          } else {
            output = `Chimpanion Terminal Commands:

${AVAILABLE_COMMANDS.map(cmd => 
  `• ${cmd.command} ${cmd.args.join(' ')} - ${cmd.description}`
).join('\n')}

Type 'help <command>' for detailed help on a specific command.`;
          }
          break;

        case 'clear':
          setHistory([]);
          setIsProcessing(false);
          return;

        default:
          output = `Unknown command: ${command}. Type 'help' for available commands.`;
          success = false;
      }

      setHistory(prev => prev.map(entry => 
        entry.id === newEntry.id 
          ? { ...entry, output, success }
          : entry
      ));
    } catch (error) {
      setHistory(prev => prev.map(entry => 
        entry.id === newEntry.id 
          ? { 
              ...entry, 
              output: 'Error: Failed to execute command', 
              success: false 
            }
          : entry
      ));
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chimpanion Terminal
          </h3>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 bg-gray-900 text-green-400 font-mono text-sm"
      >
        {history.map((entry) => (
          <div key={entry.id} className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">user@chimpanion:~$</span>
              <span className="text-white">{entry.input}</span>
            </div>
            {entry.output && (
              <div className={`mt-1 whitespace-pre-wrap ${
                entry.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">user@chimpanion:~$</span>
            <span className="text-white">{input}</span>
            <span className="animate-pulse">|</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
            user@chimpanion:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-mono text-sm"
            disabled={isProcessing}
            autoFocus
          />
          <Button
            onClick={executeCommand}
            disabled={!input.trim() || isProcessing}
            size="sm"
            className="h-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 