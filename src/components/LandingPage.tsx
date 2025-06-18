import { Button } from '@/components/ui/button';
import { Wallet, Zap, MessageCircle, Shield, TrendingUp, Bot } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Chimpanion</span>
          </div>
          <Button
            onClick={onLogin}
            className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-6 py-2 rounded-full"
          >
            Sign in with 𝕏
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {" "}Crypto Wallet
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Chimpanion understands natural language commands. Simply tweet @ChimpanionApp or use our terminal 
            to trade, bet on prediction markets, and manage assets across multiple blockchains.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={onLogin}
              size="lg"
              className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-8 py-4 rounded-full text-lg"
            >
              Get Started with 𝕏
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-full text-lg"
            >
              View Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={<Bot className="h-8 w-8" />}
              title="AI Commands"
              description="Use natural language to control your wallet. 'Send 100 USDC to Alice' or 'Bet on Bitcoin hitting $100k'"
            />
            <FeatureCard
              icon={<MessageCircle className="h-8 w-8" />}
              title="Social Trading"
              description="Tweet commands @ChimpanionApp to execute trades directly from Twitter. No app switching needed."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Prediction Markets"
              description="Bet on tech, politics, culture, and more. AI helps you find the best odds and opportunities."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Multi-Chain"
              description="Seamlessly operate across Base, ApeChain, and Solana. More networks coming soon."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Non-Custodial"
              description="Your keys, your coins. Powered by Privy's enterprise-grade wallet infrastructure."
            />
            <FeatureCard
              icon={<Wallet className="h-8 w-8" />}
              title="Instant Setup"
              description="Get your wallet in seconds with just your Twitter account. No seed phrases to manage."
            />
          </div>

          {/* Supported Networks */}
          <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Supported Networks</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <NetworkLogo name="Base" />
              <NetworkLogo name="ApeChain" />
              <NetworkLogo name="Solana" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-blue-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function NetworkLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
    </div>
  );
} 