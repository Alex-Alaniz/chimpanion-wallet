export function MarketsList() {
  const mockMarkets = [
    {
      id: 'market_1',
      title: 'Will Bitcoin reach $100k by end of 2024?',
      category: 'tech',
      endDate: '2024-12-31',
      totalVolume: '50000',
      outcomes: [
        { name: 'Yes', odds: 1.8, totalBets: '30000' },
        { name: 'No', odds: 2.2, totalBets: '20000' }
      ]
    },
    {
      id: 'market_2',
      title: 'Will Trump win 2024 election?',
      category: 'politics',
      endDate: '2024-11-05',
      totalVolume: '100000',
      outcomes: [
        { name: 'Yes', odds: 1.5, totalBets: '60000' },
        { name: 'No', odds: 2.5, totalBets: '40000' }
      ]
    },
    {
      id: 'market_3',
      title: 'Will Apple release AR glasses in 2024?',
      category: 'tech',
      endDate: '2024-12-31',
      totalVolume: '25000',
      outcomes: [
        { name: 'Yes', odds: 3.2, totalBets: '8000' },
        { name: 'No', odds: 1.3, totalBets: '17000' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Prediction Markets
        </h2>
        
        {/* Filter tabs would go here */}
        <div className="flex space-x-1 mb-6">
          {['All', 'Tech', 'Politics', 'Culture', 'Sports'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mockMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: any }) {
  const categoryColors = {
    tech: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    politics: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    culture: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    sports: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              categoryColors[market.category as keyof typeof categoryColors] || categoryColors.tech
            }`}>
              {market.category.charAt(0).toUpperCase() + market.category.slice(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ends {new Date(market.endDate).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {market.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Volume: ${parseInt(market.totalVolume).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {market.outcomes.map((outcome: any, index: number) => (
          <div
            key={index}
            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {outcome.name}
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {outcome.odds}x
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ${parseInt(outcome.totalBets).toLocaleString()} volume
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 