# Chimpanion - AI-Powered Blockchain Wallet Documentation

## 📋 Project Overview

**Chimpanion** is an AI-powered crypto wallet application with advanced blockchain capabilities, featuring:
- Multi-chain support (Base, Solana, ApeChain)
- AI-powered transaction assistance
- Multiple interfaces (Web UI, Terminal Commands, Twitter Integration)
- Real-time balance checking and transaction processing
- Smart wallet functionality with OnchainKit integration

## 🚀 Current Project Status

### ✅ What's Working
- **Frontend UI**: Modern wallet interface with real-time balance display
- **Multi-chain Integration**: Base, Solana, and ApeChain network support
- **AI Chat Interface**: Enhanced with blockchain tools and natural language processing
- **Terminal Commands**: CLI-style blockchain operations via API
- **Twitter Integration**: Social media command processing for blockchain operations
- **Balance Checking**: Real-time wallet balance fetching across all supported chains
- **Transaction Simulation**: Safe testing environment for all operations

### 🔧 What's Ready for Production (Requires CDP Setup)
- **Real Transactions**: Transfer, swap, and deploy operations
- **Wallet Creation**: Generate new wallets programmatically
- **Advanced DeFi Operations**: Yield farming, liquidity provision
- **NFT Operations**: Minting, trading, and management

## 🔑 Environment Setup

### Required Environment Variables

Create a `.env.local` file with:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Coinbase Developer Platform (CDP)
CDP_API_KEY_NAME=your_cdp_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_cdp_api_key_private_key

# RPC Endpoints
ALCHEMY_API_KEY=your_alchemy_key
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY

# Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_APECHAIN_RPC_URL=https://apechain.calderachain.xyz/http

# App Configuration
NEXT_PUBLIC_APP_NAME=Chimpanion
TWITTER_BEARER_TOKEN=your_twitter_bearer_token (optional)

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### CDP API Key Setup

Your CDP credentials are in `@cdp_api_key.json`:
- **Key ID**: `1f0b717c-1337-404d-b610-a20a4f7b352f`
- **Private Key**: Available in your JSON file
- **Status**: ✅ Ready for integration

## 🏗️ Architecture Overview

### Backend Components

#### 1. Coinbase AgentKit Integration (`src/lib/coinbase-agentkit.ts`)
```typescript
// Handles CDP SDK initialization and wallet operations
- Wallet creation and management
- Transaction processing
- Real blockchain interactions
```

#### 2. Blockchain Tools (`src/lib/blockchain-tools.ts`)
```typescript
// Core blockchain functionality
- Balance checking across all chains
- Transaction simulation and execution
- Multi-chain support utilities
```

#### 3. API Endpoints
- **`/api/chat`**: Enhanced AI chat with blockchain tools
- **`/api/terminal`**: CLI-style command processing
- **`/api/social-commands`**: Twitter integration for blockchain commands
- **`/api/initialize-wallets`**: Create or retrieve user's server wallets
- **`/api/wallet-balances`**: Fetch wallet balances across all chains
- **`/api/twitter-webhook`**: Handle Twitter mentions and create wallets for mentioned users
- **`/api/subscription`**: Check user's premium subscription status

### Frontend Components

#### Current UI Features
- Real-time balance display
- Chain and asset separation (Bankr-style UI)
- Transaction history
- AI chat interface
- Wallet management

## 📦 SDK Integration Guide

### 1. CDP SDK (Backend) - ✅ Installed
```bash
npm install @coinbase/cdp-sdk
```

**Current Usage**:
- Wallet operations
- Transaction processing
- Multi-chain support

**Documentation**: [CDP SDK GitHub](https://github.com/coinbase/cdp-sdk)

### 2. OnchainKit (Frontend) - 🔄 Next Step
```bash
npm install @coinbase/onchainkit
```

**Planned Features**:
- Smart Wallet components
- Enhanced transaction UI
- Better UX for onchain operations
- Ready-to-use React components

**Documentation**: [OnchainKit Base](https://www.base.org/builders/onchainkit)

## 🧪 Testing Procedures

### 1. Basic Functionality Testing

```bash
# Start the development server
npm run dev

# Test balance checking (should work immediately)
curl -X POST http://localhost:3000/api/terminal \
  -H "Content-Type: application/json" \
  -d '{"command": "balance"}'
```

### 2. AI Chat Testing
- Visit `http://localhost:3000`
- Test commands like:
  - "Show my wallet balance"
  - "What tokens do I have?"
  - "Simulate a transfer to [address]"

### 3. Terminal Commands Testing
Available commands:
- `balance` - Check wallet balances
- `transfer <amount> <token> to <address>` - Transfer tokens
- `swap <amount> <from> to <to>` - Swap tokens
- `deploy token <name> <symbol>` - Deploy ERC20 token
- `help` - Show all commands

### 4. Twitter Integration Testing
- Mention your Twitter bot with commands
- Commands work the same as terminal/chat

## 🔐 Security Considerations

### Credential Management
- ✅ CDP keys secured in `.gitignore`
- ✅ Environment variables for all sensitive data
- ✅ Separate development/production configurations

### Transaction Safety
- ✅ Simulation mode for testing
- ✅ Confirmation prompts for real transactions
- ✅ Amount limits and validation

## 🎯 Next Steps & Implementation Roadmap

### Phase 1: CDP Integration (Immediate - 1-2 days)
1. **Update environment configuration** with your CDP credentials
2. **Test real transactions** in development environment
3. **Configure wallet creation** and management
4. **Implement transaction confirmations** and error handling

### Phase 2: OnchainKit Integration (1 week)
1. **Install OnchainKit** and dependencies
2. **Add Smart Wallet components** to the UI
3. **Enhance transaction interface** with better UX
4. **Implement wallet connect** functionality
5. **Add transaction history** and status tracking

### Phase 3: Advanced Features (2-3 weeks)
1. **DeFi Operations**: Yield farming, liquidity provision
2. **NFT Support**: Minting, trading, collection management
3. **Multi-signature Support**: Team wallet management
4. **Advanced AI Features**: Market analysis, automated trading
5. **Mobile Support**: React Native or PWA implementation

### Phase 4: Production Deployment (1 week)
1. **Production environment** setup
2. **Security audit** and testing
3. **Performance optimization**
4. **User onboarding** and documentation
5. **Monitoring and analytics** setup

## 🔧 Immediate Action Items

### 1. Environment Setup (5 minutes)
```bash
# Copy your CDP credentials to environment
echo "CDP_API_KEY_NAME=1f0b717c-1337-404d-b610-a20a4f7b352f" >> .env.local
echo "CDP_API_KEY_PRIVATE_KEY=YOUR_PRIVATE_KEY_FROM_JSON" >> .env.local
```

### 2. Test Real Transactions (10 minutes)
```bash
# Test wallet creation
curl -X POST http://localhost:3000/api/terminal \
  -H "Content-Type: application/json" \
  -d '{"command": "create wallet"}'

# Test balance with real CDP
curl -X POST http://localhost:3000/api/terminal \
  -H "Content-Type: application/json" \
  -d '{"command": "balance real"}'
```

### 3. OnchainKit Installation (30 minutes)
```bash
npm install @coinbase/onchainkit
npm install @rainbow-me/rainbowkit wagmi viem
```

## 🎨 UI/UX Enhancements with OnchainKit

### Smart Wallet Components
```typescript
// Future implementation with OnchainKit
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { TransactionButton } from '@coinbase/onchainkit/transaction';
```

### Planned UI Improvements
- **One-click wallet connection**
- **Transaction status indicators**
- **Gas fee estimation**
- **Token approval interfaces**
- **NFT galleries**
- **DeFi protocol integration**

## 📊 Membership & Access Configuration

### User Tiers (Recommended Implementation)
1. **Free Tier**: Balance checking, simulated transactions
2. **Basic Tier**: Real transactions, limited volume
3. **Premium Tier**: Advanced features, higher limits
4. **Enterprise Tier**: Custom integrations, white-label

### Access Control Implementation
```typescript
// Future implementation in middleware
const membershipLimits = {
  free: { transactions: 0, volume: 0 },
  basic: { transactions: 100, volume: 1000 },
  premium: { transactions: 1000, volume: 10000 },
  enterprise: { transactions: -1, volume: -1 }
};
```

## 🛠️ Development Tools & Resources

### Essential Documentation
- [CDP SDK Documentation](https://github.com/coinbase/cdp-sdk)
- [OnchainKit Documentation](https://www.base.org/builders/onchainkit)
- [Base Network Docs](https://docs.base.org/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

### Development Environment
- **Node.js**: v18+ required
- **Next.js**: v14+ (current setup)
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling

## 🚀 Production Readiness Checklist

### Infrastructure
- [ ] Environment variables configured
- [ ] CDP credentials integrated
- [ ] OnchainKit components added
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Security
- [ ] Input validation complete
- [ ] Transaction confirmations active
- [ ] Private key management secure
- [ ] API endpoint protection enabled

### Features
- [ ] Real transaction processing
- [ ] Multi-chain support verified
- [ ] AI responses optimized
- [ ] User interface polished

### Testing
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met

## 📧 Support & Resources

### Getting Help
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Join the Coinbase Developer Platform Discord
- **Documentation**: Comprehensive guides and API references

### Community Resources
- **Base Builders**: Community of onchain developers
- **Coinbase Cloud**: Infrastructure and scaling support
- **Developer Programs**: Grants and accelerator programs

## Transaction Signing Methods

### 1. Standard Privy Popup (Current Implementation)
When users request transactions, Privy shows a secure popup for approval:
- Transaction details displayed clearly
- User must approve in Privy UI
- Suitable for web interface

### 2. Bankr.bot-Style Yes/No Confirmations (Enhanced Flow)
Inspired by [Bankr.bot](https://bankr.bot/), this provides a streamlined UX:

#### How It Works:
1. User requests transaction: "Send 0.1 ETH to 0x123..."
2. Bot responds with confirmation message:
   ```
   🔐 Confirm Transaction:
   
   Send 0.1 ETH to 0x123...abc
   From: 0x456...def
   Chain: Base
   
   Reply "Yes" to confirm or "No" to cancel.
   ```
3. User simply replies "Yes" or "No"
4. Transaction executes server-side using Privy authorization keys

#### Implementation Components:
- **Transaction Manager** (`src/lib/transaction-manager.ts`): Handles pending transactions
- **Server Executor** (`src/lib/privy-server-transaction.ts`): Executes confirmed transactions
- **Confirmation Flow**: Integrated into chat API route

#### Benefits:
- ✅ No popups or browser redirects
- ✅ Works seamlessly in chat and Twitter
- ✅ Simple yes/no responses
- ✅ 5-minute expiration for security

#### Security:
- Transactions prepared but not executed until confirmed
- User consent captured explicitly
- Time-limited confirmation window
- All transactions logged

### Twitter Integration
For Twitter mentions/replies, the same yes/no flow works:
1. User tweets: "@ChimpanionApp send 0.1 SOL to friend.sol"
2. Bot replies with confirmation request
3. User replies "Yes" to the bot's tweet
4. Transaction executes

## Premium Membership System

### User Tiers (Recommended Implementation)
1. **Free Tier**: Balance checking, simulated transactions
2. **Basic Tier**: Real transactions, limited volume
3. **Premium Tier**: Advanced features, higher limits
4. **Enterprise Tier**: Custom integrations, white-label

### Access Control Implementation
```typescript
// Future implementation in middleware
const membershipLimits = {
  free: { transactions: 0, volume: 0 },
  basic: { transactions: 100, volume: 1000 },
  premium: { transactions: 1000, volume: 10000 },
  enterprise: { transactions: -1, volume: -1 }
};
```

---

**Status**: ✅ Core infrastructure complete, ready for CDP integration and OnchainKit enhancement
**Next Milestone**: Real transaction processing with CDP credentials
**Timeline**: Production-ready in 1-2 weeks with full feature set 

## Architecture

### Server-Side Wallet Management

#### Single EVM Wallet Design
- **One EVM Wallet**: Users have a single EVM wallet address that works across all EVM-compatible chains (Base, ApeChain, etc.)
- **Chain Agnostic**: The same private key and address are used for all EVM transactions
- **Simplified UX**: Users don't need to manage multiple addresses for different EVM chains
- **Separate Solana Wallet**: Solana requires its own wallet due to different blockchain architecture

#### Wallet Persistence System
The wallet persistence is implemented using a file-based storage system for development:

1. **Storage File**: `.wallet-storage.json` (gitignored for security)
2. **Wallet IDs**: Both wallet addresses AND Privy wallet IDs are stored
3. **Automatic Loading**: Storage is loaded on server startup
4. **Auto-save**: Changes are persisted immediately

**Storage Structure**:
```json
{
  "userIdentifier": "string",
  "authMethod": "twitter|google|email|wallet",
  "wallets": {
    "evm": {
      "address": "0x...",
      "walletId": "privy-wallet-id"
    },
    "solana": {
      "address": "...",
      "walletId": "privy-wallet-id"
    }
  },
  "createdAt": "ISO-date",
  "lastAccessed": "ISO-date"
}
```

#### Wallet Creation Flow
1. User authenticates (Twitter, Google, Email, or Wallet)
2. System checks for existing wallet data
3. If exists: Retrieves wallets using stored wallet IDs
4. If new: Creates new wallets and stores complete data
5. Returns consistent wallet addresses for the user

### Key Components

#### `/lib/wallet-storage.ts`
- Persistent storage for wallet mappings
- File-based storage for development (replace with database in production)
- Stores both addresses and Privy wallet IDs

#### `/lib/privy-server-wallet.ts`
- Manages server-controlled wallets using PrivyWalletProvider
- Checks for existing wallet IDs before creating new wallets
- Maintains provider cache for performance

#### `/api/initialize-wallets`
- Endpoint called on user login
- Creates or retrieves existing wallets
- Returns wallet addresses for UI display

### Multi-Chain Support

Currently supports:
- **Base** (Chain ID: 8453) - EVM
- **ApeChain** (Chain ID: 33139) - EVM
- **Solana** - Non-EVM

### Security Considerations

1. **Environment Variables**: Privy credentials stored in `.env.local`
2. **Server-Side Only**: Private keys never exposed to client
3. **Gitignored Storage**: `.wallet-storage.json` excluded from version control
4. **Transaction Confirmation**: Users confirm with "Yes/No" in chat

### Twitter Integration

The system supports creating wallets for users mentioned on Twitter:
- Endpoint: `/api/twitter-webhook`
- User identifier format: `twitter:username`
- Wallets created automatically when mentioned
- Enables social onboarding mechanism

### Future Improvements

1. **Database Storage**: Replace file-based storage with database
2. **Wallet Recovery**: Implement backup/recovery mechanisms
3. **Multi-Signature**: Add support for multi-sig wallets
4. **Hardware Wallet**: Integration with hardware wallets
5. **Cross-Chain Bridging**: Automated asset bridging

## Development Notes

### Running Locally
```bash
npm install
npm run dev
```

### Required Environment Variables
```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
```

### Testing Wallet Persistence
The system automatically creates and persists wallets. To verify:
1. Login with your account
2. Note the wallet addresses displayed
3. Logout and login again
4. Wallet addresses should remain the same

### Troubleshooting

**New wallets created on each login**:
- Check if `.wallet-storage.json` exists
- Verify file permissions
- Check console logs for storage errors

**Balance fetch errors**:
- Ensure wallet addresses are valid
- Check RPC endpoints are accessible
- Verify API rate limits

## Key Features

### 1. Unified EVM Wallet
- Single address for all EVM chains
- Reduces confusion and simplifies fund management
- Automatic chain detection based on transaction context

### 2. Twitter Integration
- Create wallets for mentioned users who haven't signed up
- Enable fund transfers before account creation
- Viral onboarding mechanism

### 3. Real-Time Balance Display
- Live wallet balances in the UI
- Automatic refresh every 30 seconds
- Support for native tokens and major stablecoins

### 4. Transaction Flow
1. User requests transfer in chat
2. AI prepares transaction details
3. User confirms with "Yes"
4. Server signs and executes transaction
5. Confirmation displayed with transaction hash

## Technical Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Privy React SDK**: Client-side authentication

### Backend
- **Next.js API Routes**: Serverless endpoints
- **AgentKit (Coinbase)**: Wallet management and transaction execution
- **Privy Server SDK**: Server-side wallet creation
- **OpenAI SDK**: AI chat functionality

### Blockchain Integration
- **EVM Chains**: ethers.js for Base and ApeChain
- **Solana**: @solana/web3.js for Solana transactions
- **RPC Providers**: QuickNode for reliable blockchain access

## Future Enhancements

1. **More Chains**: Add support for additional EVM chains
2. **Token Swaps**: Integrate DEX aggregators
3. **NFT Support**: Display and transfer NFTs
4. **Advanced DeFi**: Yield farming, lending, staking
5. **Mobile App**: Native iOS/Android applications
6. **Telegram Bot**: Expand to other messaging platforms

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`
4. Run development server: `npm run dev`
5. Access at `http://localhost:3000`

## Production Deployment

1. **Database**: Replace in-memory storage with persistent database
2. **Redis**: Add caching for wallet providers and user sessions
3. **Security**: Implement rate limiting and transaction limits
4. **Monitoring**: Add error tracking and performance monitoring
5. **Scaling**: Use serverless functions for API routes 