'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { WalletInfo } from '@/components/WalletInfo';
import { Terminal } from '@/components/Terminal';
import { MarketsList } from '@/components/MarketsList';
import { BettingHistory } from '@/components/BettingHistory';
import { 
  LayoutDashboard, 
  Terminal as TerminalIcon, 
  TrendingUp, 
  History, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'terminal' | 'markets' | 'history';

export function WalletDashboard() {
  const { logout, user } = usePrivy();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'terminal' as TabType, label: 'Terminal', icon: TerminalIcon },
    { id: 'markets' as TabType, label: 'Markets', icon: TrendingUp },
    { id: 'history' as TabType, label: 'History', icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'terminal':
        return <Terminal />;
      case 'markets':
        return <MarketsList />;
      case 'history':
        return <BettingHistory />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Chimpanion</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.twitter?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  @{user?.twitter?.username || 'user'}
                </span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Logout button */}
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wallet Info */}
        <div className="lg:col-span-2">
          <WalletInfo />
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Hot Markets
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TerminalIcon className="h-4 w-4 mr-2" />
              Open Terminal
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <History className="h-4 w-4 mr-2" />
              Recent Bets
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent activity. Start by placing a bet or making a trade!</p>
        </div>
      </div>
    </div>
  );
} 