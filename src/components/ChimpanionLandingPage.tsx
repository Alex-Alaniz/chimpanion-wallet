'use client';

import { Button } from '@/components/ui/button';

interface ChimpanionLandingPageProps {
  onLogin: () => void;
}

export function ChimpanionLandingPage({ onLogin }: ChimpanionLandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/chimpanion-logo-placeholder.svg" 
              alt="Chimpanion" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">Chimpanion</span>
            <span className="text-sm text-teal-600 font-medium">by PRIMAPE</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
              v1.0.0-beta.1
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span>Beta</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Illustration */}
          <div className="mb-12">
            <div className="relative">
              {/* Retro Terminal/TV */}
              <div className="w-80 h-64 mx-auto bg-gradient-to-br from-amber-100 to-orange-200 rounded-3xl shadow-2xl border-8 border-amber-200 relative">
                {/* Screen */}
                <div className="absolute inset-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-inner">
                  {/* Friendly Robot Face */}
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white">
                      {/* Robot Eyes */}
                      <div className="flex space-x-4 mb-4">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                        </div>
                      </div>
                      {/* Robot Smile */}
                      <div className="w-8 h-4 border-b-2 border-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* Control Knobs */}
                <div className="absolute right-2 top-6 space-y-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
                {/* Antenna */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-1 h-4 bg-gray-400"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full -mt-1"></div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-teal-200 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-200 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Branding */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Chimpanion
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your Friendly AI-Powered Blockchain Companion
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Buy, sell, swap, place predictions, and manage your wallet effortlessly—just by sending a message.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-12">
            <Button
              onClick={onLogin}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🤖</span>
              Open Terminal
            </Button>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <a 
                href="https://warpcast.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <span>🟣</span>
                <span>Warpcast</span>
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors"
              >
                <span>𝕏</span>
                <span>X</span>
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>💬</span>
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-sm text-gray-500">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              Contract Address: 0x22aF33FE49fD1fa80c71497730e5890b3c76F3b
            </span>
          </div>
          <div className="flex justify-center space-x-6">
            <a href="/terms" className="hover:text-teal-600 transition-colors">Terms of Service</a>
            <a href="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</a>
            <span>© 2024 Chimpanion by PRIMAPE</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 