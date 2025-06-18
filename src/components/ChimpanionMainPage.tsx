'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Send, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { MembershipStatus } from './MembershipStatus';
import { LoadingScreen } from './LoadingScreen';
import Image from 'next/image';

export default function ChimpanionMainPage() {
  const { user, authenticated, logout } = usePrivy();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: '🐵 Hey there! I\'m Chimpanion, your friendly AI blockchain companion. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isMainLoading, setIsMainLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState('base');
  const [serverWallets, setServerWallets] = useState<{
    base: string | null;
    apechain: string | null;
    solana: string | null;
  }>({ base: null, apechain: null, solana: null });
  const [walletBalances, setWalletBalances] = useState<Record<string, any>>({});
  const [isInitializingWallets, setIsInitializingWallets] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get user's unique identifier
  const userIdentifier = user?.twitter?.username || 
                        user?.google?.email || 
                        user?.email?.address || 
                        user?.wallet?.address || 
                        'anonymous';
  const authMethod = user?.twitter ? 'twitter' : 
                    user?.google ? 'google' :
                    user?.email ? 'email' :
                    user?.wallet ? 'wallet' : 'anonymous';

  // Format address for display
  const formatAddress = (address: string | null) => {
    if (!address) return 'Loading...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Initialize wallets on login
  useEffect(() => {
    const initializeWallets = async () => {
      if (authenticated && userIdentifier && userIdentifier !== 'anonymous' && !isInitializingWallets) {
        setIsInitializingWallets(true);
        try {
          console.log('Initializing server wallets for:', userIdentifier);
          
          const response = await fetch('/api/initialize-wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIdentifier, authMethod })
          });

          if (response.ok) {
            const data = await response.json();
            setServerWallets(data.wallets);
            console.log('Server wallets initialized:', data.wallets);
            
            // Fetch balances for each wallet
            await fetchWalletBalances(data.wallets);
          }
        } catch (error) {
          console.error('Error initializing wallets:', error);
        } finally {
          setIsInitializingWallets(false);
        }
      }
    };

    initializeWallets();
  }, [authenticated, userIdentifier, authMethod]);

  // Fetch wallet balances
  const fetchWalletBalances = async (wallets: typeof serverWallets) => {
    try {
      // Create proper wallets object for API
      const walletsForApi = {
        evm: wallets.base || wallets.apechain, // Use either EVM address
        solana: wallets.solana
      };

      const response = await fetch('/api/wallet-balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallets: walletsForApi })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Distribute balances to each chain
        const newBalances: Record<string, any> = {};
        
        // Find EVM balance (ETH on Base/ApeChain)
        const evmBalance = data.balances.find((b: any) => b.chain === 'ethereum' || b.chain === 'base');
        if (evmBalance) {
          newBalances.base = [evmBalance];
          newBalances.apechain = [evmBalance]; // Same balance for both EVM chains
        }
        
        // Find Solana balance
        const solBalance = data.balances.find((b: any) => b.chain === 'solana');
        if (solBalance) {
          newBalances.solana = [solBalance];
        }

        setWalletBalances(newBalances);
      } else {
        console.error('Failed to fetch balances:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Refresh balances periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (serverWallets.base || serverWallets.apechain || serverWallets.solana) {
        fetchWalletBalances(serverWallets);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [serverWallets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMainLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && isAudioEnabled) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_`#]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      synthRef.current = new SpeechSynthesisUtterance(cleanText);
      synthRef.current.rate = 1.0;
      synthRef.current.pitch = 1.0;
      window.speechSynthesis.speak(synthRef.current);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (!isAudioEnabled && messages.length > 0) {
      const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
      if (lastAssistantMessage) {
        speakMessage(lastAssistantMessage.content);
      }
    } else {
      stopSpeaking();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          sessionId,
          userIdentifier,
          authMethod,
          serverWallets
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
              if (data.sessionId) {
                setSessionId(data.sessionId);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      if (isAudioEnabled && assistantMessage) {
        speakMessage(assistantMessage);
      }

      // Refresh balances after any transaction
      if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('send')) {
        setTimeout(() => fetchWalletBalances(serverWallets), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMainLoading) {
    return <LoadingScreen />;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🐵</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chimpanion AI</h1>
              <p className="text-sm text-gray-600">Your blockchain companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                @{userIdentifier}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg transition-colors ${
                isAudioEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
              }`}
              title={isAudioEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                {message.role === 'assistant' && (
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about crypto, DeFi, or blockchain..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send size={20} />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Panel - Wallet Info */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        {/* Membership Status */}
        <div className="mb-6">
          <MembershipStatus />
        </div>

        {/* Server Wallets */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔐</span> Your Server Wallets
          </h3>
          
          {/* Info about single EVM wallet */}
          {serverWallets.base && serverWallets.base === serverWallets.apechain && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>ℹ️ One EVM Wallet:</strong> Your Base and ApeChain addresses are the same. 
                This single wallet works across all EVM-compatible chains.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Chain Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setSelectedChain('base')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedChain === 'base' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Base
              </button>
              <button
                onClick={() => setSelectedChain('solana')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedChain === 'solana' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Solana
              </button>
              <button
                onClick={() => setSelectedChain('apechain')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedChain === 'apechain' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ApeChain
              </button>
            </div>

            {/* Selected Chain Display */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {selectedChain === 'base' && (
                    <Image src="/base-logo.png" alt="Base" width={24} height={24} className="rounded-full" />
                  )}
                  {selectedChain === 'solana' && (
                    <Image src="/solana-logo.svg" alt="Solana" width={24} height={24} />
                  )}
                  {selectedChain === 'apechain' && (
                    <Image src="/apechain.png" alt="ApeChain" width={24} height={24} className="rounded-full" />
                  )}
                  <span className="font-medium capitalize">{selectedChain}</span>
                  {selectedChain !== 'solana' && (
                    <span className="text-xs text-gray-500">(EVM)</span>
                  )}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(serverWallets[selectedChain as keyof typeof serverWallets] || '')}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  disabled={!serverWallets[selectedChain as keyof typeof serverWallets]}
                >
                  Copy
                </button>
              </div>
              
              <div className="text-xs text-gray-600 font-mono mb-2">
                {formatAddress(serverWallets[selectedChain as keyof typeof serverWallets])}
              </div>

              {/* Balance Display */}
              {walletBalances[selectedChain] && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">Balance</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {walletBalances[selectedChain]?.[0]?.balance || '0.0000'} {walletBalances[selectedChain]?.[0]?.symbol}
                    </span>
                    <span className="text-sm text-gray-500">
                      ${walletBalances[selectedChain]?.[0]?.balanceUSD || '0.00'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Value */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Portfolio Value</div>
              <div className="text-2xl font-bold text-gray-800">
                ${Object.values(walletBalances).flat().reduce((acc: number, balance: any) => 
                  acc + parseFloat(balance?.balanceUSD || '0'), 0
                ).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setInput('Check my wallet balances')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              💰 Check Balances
            </button>
            <button 
              onClick={() => setInput('Send 0.001 SOL to APEShoBNNvnM4JV6pW51vb8X4Cq6ZeZy6DqfjmTu6j4z')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              📤 Send Crypto
            </button>
            <button 
              onClick={() => setInput('Swap 0.001 ETH to USDC on Base')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              🔄 Swap Tokens
            </button>
            <button 
              onClick={() => setInput('What can you help me with?')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              ❓ Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 