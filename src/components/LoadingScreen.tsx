export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chimpanion</h1>
          <p className="text-gray-600 dark:text-gray-300">AI-Powered Agentic Wallet</p>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Initializing your intelligent wallet...
        </p>
      </div>
    </div>
  );
} 