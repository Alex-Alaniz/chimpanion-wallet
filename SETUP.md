# Chimpanion AI Setup Guide

> 📋 **For comprehensive project documentation, architecture details, and roadmap, see `PROJECT-DOCUMENTATION.md`**

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

### Required for AI Chat
```bash
# OpenAI API Key (required for AI chat)
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional - For Full On-Chain Capabilities
```bash
# Coinbase CDP AgentKit (for real on-chain transactions)
# ✅ Your CDP credentials are ready in @cdp_api_key.json
CDP_API_KEY_NAME=1f0b717c-1337-404d-b610-a20a4f7b352f
CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key_from_json_file
NETWORK_ID=base-sepolia

# Privy (should already be set)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret_here

# Twitter API (for social commands - optional)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
NEXT_PUBLIC_TWITTER_HANDLE=ChimpanionApp

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Authorization Keys (Optional - for Bankr.bot-style yes/no transactions)
PRIVY_WALLET_AUTHORIZATION_PRIVATE_KEY=your-auth-private-key
PRIVY_WALLET_AUTHORIZATION_KEY_ID=your-auth-key-id
```

## Quick Start

1. **Get OpenAI API Key** (Required)
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Add it to your `.env.local` as `OPENAI_API_KEY`

2. **Test AI Chat**
   - Restart your development server: `npm run dev`
   - Try chatting with Chimpanion - it now uses real AI!

3. **Add On-Chain Capabilities** (Optional)
   - Sign up at https://portal.cdp.coinbase.com/
   - Create API credentials
   - Add CDP variables to enable real on-chain transactions

## Current AI Capabilities

✅ **Working Now:**
- **Intelligent chat responses** with real AI
- **Real wallet balance checking** across Base, Solana, and ApeChain
- **Live blockchain data** - fetches actual balances from the networks
- **Transaction simulations** - demo transfers, swaps, and deployments
- **Terminal commands** - CLI-style blockchain operations
- **Twitter integration** - same commands via @mentions
- **Setup guidance** - helps configure real transactions
- Crypto/DeFi knowledge and security guidance

🚧 **Requires CDP Setup for Real Transactions:**
- Actual token transfers and swaps
- Real smart contract deployments
- Cross-chain bridges and advanced DeFi operations

## Testing the AI & Blockchain Features

### 💬 **Chat Interface:**
- **"Check my wallet balance"** - Gets real balances from Base, Solana, and ApeChain
- **"Send 0.01 ETH to 0x123..."** - Simulates token transfers
- **"Swap 0.1 ETH for USDC"** - Simulates token swaps
- **"Deploy token MyToken MTK"** - Simulates contract deployment
- **"What blockchain capabilities do you have?"** - Shows available features
- **"Help me with blockchain setup"** - Setup instructions

### 🖥️ **Terminal Commands:**
Test via `POST /api/terminal` with JSON: `{"command": "your_command"}`
- `send 0.01 ETH to 0x1234567890123456789012345678901234567890`
- `swap 0.1 ETH for USDC`
- `deploy token MyToken MTK 1000000`
- `help blockchain setup`

### 🐦 **Twitter Integration:**
Mention @ChimpanionApp with these commands:
- `@ChimpanionApp send 0.01 ETH to 0x123...`
- `@ChimpanionApp swap 0.1 ETH for USDC`
- `@ChimpanionApp deploy token MyToken MTK`
- `@ChimpanionApp help blockchain`

### ⚡ **Real Features Working Now:**
- ✅ Live wallet balance checking (Base, Solana, ApeChain)
- ✅ USD value calculations with real pricing
- ✅ Auto-refresh when wallets connect
- ✅ Transaction simulations with realistic outputs
- ✅ Multi-interface support (Chat, Terminal, Twitter)
- ✅ Setup guidance and help system

## 🚀 Current Status & Next Steps

**Your project is ready for real blockchain transactions!**

✅ **CDP Credentials Available**: Your API key is in `@cdp_api_key.json` (secured in `.gitignore`)
✅ **Core Infrastructure**: All blockchain tools and AI integration complete
✅ **Multi-Interface Support**: Web UI, Terminal Commands, and Twitter integration working

**Immediate Next Steps** (5-30 minutes):
1. **Copy CDP credentials** from `@cdp_api_key.json` to your `.env.local`
2. **Install OnchainKit** for enhanced UI: `npm install @coinbase/onchainkit`
3. **Test real transactions** using the terminal API or chat interface

See `PROJECT-DOCUMENTATION.md` for detailed roadmap and advanced configuration options. 

### Getting Your API Keys:

1. **Privy**: 
   - Sign up at [Privy.io](https://privy.io)
   - Create a new app
   - Find your App ID and App Secret in the dashboard
   - Note: App Secret is required for server-side wallet operations

2. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. **Coinbase CDP** (optional): Follow the [CDP setup guide](./setup-cdp.sh)

4. **Privy Authorization Keys** (optional - for yes/no transactions):
   - Go to your Privy dashboard
   - Navigate to "Authorization Keys"
   - Create a new key with "Create and modify wallets" permission
   - Save the private key and key ID securely
   - This enables Bankr.bot-style yes/no transaction confirmations

## Running the App 