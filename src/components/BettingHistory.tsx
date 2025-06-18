import { useState } from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BettingHistory() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  const mockBets = [
    {
      id: 'bet_1',
      marketTitle: 'Will Bitcoin reach $100k by end of 2024?',
      outcome: 'Yes',
      amount: '100',
      token: 'USDC',
      odds: 1.8,
      status: 'pending' as const,
      createdAt: new Date('2024-01-15'),
      potentialPayout: '180'
    },
    {
      id: 'bet_2',
      marketTitle: 'Will Trump win 2024 election?',
      outcome: 'Yes',
      amount: '50',
      token: 'USDC',
      odds: 1.5,
      status: 'won' as const,
      createdAt: new Date('2024-01-10'),
      settledAt: new Date('2024-01-20'),
      payout: '75'
    },
    {
      id: 'bet_3',
      marketTitle: 'Will Apple release AR glasses in 2024?',
      outcome: 'Yes',
      amount: '75',
      token: 'USDC',
      odds: 3.2,
      status: 'lost' as const,
      createdAt: new Date('2024-01-05'),
      settledAt: new Date('2024-01-25')
    }
  ];

  const filteredBets = mockBets.filter(bet => filter === 'all' || bet.status === filter);

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    won: <CheckCircle className="h-4 w-4 text-green-500" />,
    lost: <XCircle className="h-4 w-4 text-red-500" />
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Betting History
        </h2>
        
        {/* Filter tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'all', label: 'All Bets' },
            { key: 'pending', label: 'Pending' },
            { key: 'won', label: 'Won' },
            { key: 'lost', label: 'Lost' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Bets"
            value={mockBets.length.toString()}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Total Wagered"
            value="$225"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Total Won"
            value="$75"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Win Rate"
            value="33%"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        {/* Bets List */}
        <div className="space-y-4">
          {filteredBets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No bets found for the selected filter.
            </div>
          ) : (
            filteredBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-gray-600 dark:text-gray-400">{icon}</div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function BetCard({ bet }: { bet: any }) {
  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    won: <CheckCircle className="h-4 w-4 text-green-500" />,
    lost: <XCircle className="h-4 w-4 text-red-500" />
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {bet.marketTitle}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
              statusColors[bet.status]
            }`}>
              {statusIcons[bet.status]}
              <span className="ml-1 capitalize">{bet.status}</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {bet.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Outcome</span>
          <div className="font-medium text-gray-900 dark:text-white">{bet.outcome}</div>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Bet Amount</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {bet.amount} {bet.token}
          </div>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Odds</span>
          <div className="font-medium text-gray-900 dark:text-white">{bet.odds}x</div>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            {bet.status === 'pending' ? 'Potential Payout' : 'Payout'}
          </span>
          <div className="font-medium text-gray-900 dark:text-white">
            {bet.status === 'pending' 
              ? `${bet.potentialPayout} ${bet.token}`
              : bet.status === 'won'
                ? `${bet.payout} ${bet.token}`
                : `0 ${bet.token}`
            }
          </div>
        </div>
      </div>

      {bet.status === 'won' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button size="sm" className="w-full sm:w-auto">
            Claim Winnings
          </Button>
        </div>
      )}
    </div>
  );
} 