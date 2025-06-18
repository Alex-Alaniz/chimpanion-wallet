'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { WalletInfo } from '@/components/WalletInfo';
import { extractTwitterProfile } from '@/lib/privy';
import { 
  MessageCircle, 
  Wallet, 
  TrendingUp, 
  History, 
  LogOut,
  Send,
  Bot,
  User,
  Sparkles
} from 'lucide-react';

type Message = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function ChimpanionDashboard() {
  const { logout, user } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [showWallet, setShowWallet] = useState(false);

  // Set initial assistant message on client only
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: '👋 Hey there! I\'m Chimpanion, your friendly blockchain companion. How can I help you today?',
        timestamp: new Date()
      }
    ]);
    setMessagesUsed(1);
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setMessagesUsed(prev => prev + 1);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '🤖 I received your message! This is where I\'ll help you with wallet operations, predictions, and more. AI integration coming soon!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const getProfile = () => {
    try {
      if (user) {
        const twitterProfile = extractTwitterProfile(user);
        return {
          handle: twitterProfile.twitterHandle,
          displayName: twitterProfile.twitterDisplayName,
          profileImage: twitterProfile.profileImageUrl
        };
      }
    } catch (error) {
      // Fallback if no Twitter profile
    }
    
    return {
      handle: 'user',
      displayName: 'User',
      profileImage: '/default-avatar.png'
    };
  };

  const profile = getProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/chimpanion-logo.png" 
                alt="Chimpanion" 
                className="w-8 h-8"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Chimpanion</h1>
                <p className="text-xs text-teal-400">by PRIMAPE</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-teal-900/50 text-teal-300 rounded-full">
                  v1.0.0-beta.1
                </span>
                <div className="flex items-center space-x-1 text-slate-400">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span className="text-xs">Beta</span>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800/30 border-r border-slate-700 p-4">
          <div className="space-y-4">
            {/* User Profile */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={profile.profileImage} 
                  alt={profile.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-white font-medium">{profile.displayName}</p>
                  <p className="text-slate-400 text-sm">@{profile.handle}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Button
                variant={!showWallet ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setShowWallet(false)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button
                variant={showWallet ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setShowWallet(true)}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictions
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </nav>

            {/* Message Counter */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">{messagesUsed}/10</div>
                <p className="text-slate-400 text-sm">free messages used</p>
                {messagesUsed >= 10 && (
                  <Button className="w-full mt-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {showWallet ? (
            <div className="p-6">
              <WalletInfo />
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'assistant' && (
                          <Bot className="w-4 h-4 mt-0.5 text-teal-400" />
                        )}
                        {message.type === 'user' && (
                          <User className="w-4 h-4 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-slate-700 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={messagesUsed >= 10 ? "Upgrade to continue chatting..." : "Ask me anything about your wallet..."}
                    disabled={messagesUsed >= 10}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || messagesUsed >= 10}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Chimpanion is currently in beta and may occasionally make mistakes. Use at your own risk.
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 