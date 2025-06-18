#!/bin/bash

# Chimpanion CDP Setup Script
echo "🚀 Setting up CDP credentials for Chimpanion..."

# Check if CDP key file exists
if [ ! -f "@cdp_api_key.json" ]; then
    echo "❌ CDP key file '@cdp_api_key.json' not found!"
    echo "Please make sure your CDP credentials file is in the root directory."
    exit 1
fi

# Extract credentials from JSON
CDP_KEY_NAME=$(grep -o '"id": *"[^"]*"' @cdp_api_key.json | sed 's/"id": *"\(.*\)"/\1/')
CDP_PRIVATE_KEY=$(grep -o '"privateKey": *"[^"]*"' @cdp_api_key.json | sed 's/"privateKey": *"\(.*\)"/\1/')

# Check if .env.local exists, create if not
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Check if CDP variables already exist
if grep -q "CDP_API_KEY_NAME" .env.local; then
    echo "⚠️  CDP credentials already exist in .env.local"
    echo "Do you want to update them? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
    # Remove existing CDP lines
    grep -v "CDP_API_KEY_NAME\|CDP_PRIVATE_KEY" .env.local > .env.local.tmp
    mv .env.local.tmp .env.local
fi

# Add CDP credentials to .env.local
echo "" >> .env.local
echo "# Coinbase CDP Credentials" >> .env.local
echo "CDP_API_KEY_NAME=$CDP_KEY_NAME" >> .env.local
echo "CDP_PRIVATE_KEY=$CDP_PRIVATE_KEY" >> .env.local

echo "✅ CDP credentials successfully added to .env.local!"
echo ""
echo "🎯 Next steps:"
echo "1. Add your OpenAI API key to .env.local if not already added"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test real blockchain transactions!"
echo ""
echo "📚 See PROJECT-DOCUMENTATION.md for comprehensive setup guide"
echo "🚀 See SETUP.md for quick testing instructions" 