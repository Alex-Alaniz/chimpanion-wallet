'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAddress, formatAmount, formatUSD } from '@/lib/utils';
import { SUPPORTED_CHAINS } from '@/types';

export function WalletInfo() {
  const { user } = usePrivy();
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [showBalance, setShowBalance] = useState(true);
  const [balances, setBalances] = useState({
    native: '0',
    usdc: '0',
    totalUsd: 0
  });

  const walletAddress = user?.wallet?.address || '0x0000000000000000000000000000000000000000';

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    // You could add a toast notification here
  };

  const openExplorer = () => {
    const explorerUrl = getExplorerUrl(selectedChain.id, walletAddress);
    window.open(explorerUrl, '_blank');
  };

  const getExplorerUrl = (chain: string, address: string) => {
    switch (chain) {
      case 'base':
        return `https://basescan.org/address/${address}`;
      case 'apechain':
        return `https://apechain.calderaexplorer.xyz/address/${address}`;
      case 'solana':
        return `https://solscan.io/account/${address}`;
      default:
        return '#';
    }
  };

  useEffect(() => {
    // Mock balance loading - replace with actual balance fetching
    const loadBalances = async () => {
      // Simulate API call
      setBalances({
        native: '0.025',
        usdc: '150.00',
        totalUsd: 247.50
      });
    };

    loadBalances();
  }, [selectedChain, walletAddress]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Wallet Overview
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedChain.id}
            onChange={(e) => {
              const chain = SUPPORTED_CHAINS.find(c => c.id === e.target.value);
              if (chain) setSelectedChain(chain);
            }}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Select blockchain network"
          >
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Wallet Address
        </label>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="flex-1 font-mono text-sm text-gray-900 dark:text-white">
            {formatAddress(walletAddress, 12)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openExplorer}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Balances */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Balances
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 p-0"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          {/* Total Value */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio Value</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {showBalance ? formatUSD(balances.totalUsd) : '••••••'}
            </div>
          </div>

          {/* Individual Balances */}
          <div className="grid grid-cols-2 gap-3">
            <BalanceCard
              symbol={selectedChain.symbol}
              balance={balances.native}
              usdValue={balances.totalUsd * 0.7} // Mock calculation
              showBalance={showBalance}
            />
            <BalanceCard
              symbol="USDC"
              balance={balances.usdc}
              usdValue={parseFloat(balances.usdc)}
              showBalance={showBalance}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            Deposit
          </Button>
          <Button variant="outline" className="w-full">
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ 
  symbol, 
  balance, 
  usdValue, 
  showBalance 
}: { 
  symbol: string; 
  balance: string; 
  usdValue: number; 
  showBalance: boolean; 
}) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="text-sm text-gray-600 dark:text-gray-400">{symbol}</div>
      <div className="font-semibold text-gray-900 dark:text-white">
        {showBalance ? formatAmount(balance) : '••••'}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {showBalance ? formatUSD(usdValue) : '••••'}
      </div>
    </div>
  );
} 