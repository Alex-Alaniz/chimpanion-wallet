-- Production Database Schema for Chimpanion Wallet Storage
-- Compatible with Supabase PostgreSQL

-- Create enum for auth methods
CREATE TYPE auth_method AS ENUM ('twitter', 'google', 'email', 'wallet', 'twitter-mention', 'anonymous');

-- Main wallet storage table
CREATE TABLE user_wallets (
  id SERIAL PRIMARY KEY,
  user_identifier VARCHAR(255) UNIQUE NOT NULL,
  auth_method auth_method NOT NULL,
  
  -- EVM wallet data
  evm_address VARCHAR(42),
  evm_wallet_id VARCHAR(255),
  
  -- Solana wallet data  
  solana_address VARCHAR(44),
  solana_wallet_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_identifier ON user_wallets(user_identifier);
CREATE INDEX idx_auth_method ON user_wallets(auth_method);
CREATE INDEX idx_evm_address ON user_wallets(evm_address);
CREATE INDEX idx_solana_address ON user_wallets(solana_address);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_wallets_updated_at 
  BEFORE UPDATE ON user_wallets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Transaction history table (optional, for audit)
CREATE TABLE wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_identifier VARCHAR(255) NOT NULL,
  chain VARCHAR(50) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  amount DECIMAL(36, 18) NOT NULL,
  token_symbol VARCHAR(20),
  transaction_hash VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key to user_wallets
  FOREIGN KEY (user_identifier) REFERENCES user_wallets(user_identifier)
);

-- Indexes for transactions
CREATE INDEX idx_transaction_user ON wallet_transactions(user_identifier);
CREATE INDEX idx_transaction_status ON wallet_transactions(status);
CREATE INDEX idx_transaction_created ON wallet_transactions(created_at);

-- Subscription table (for premium features)
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_identifier VARCHAR(255) UNIQUE NOT NULL,
  subscription_type VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key to user_wallets
  FOREIGN KEY (user_identifier) REFERENCES user_wallets(user_identifier)
);

-- Indexes for subscriptions
CREATE INDEX idx_subscription_status ON user_subscriptions(status);
CREATE INDEX idx_subscription_expires ON user_subscriptions(expires_at);

-- Session storage (for chat history)
CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_identifier VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to user_wallets
  FOREIGN KEY (user_identifier) REFERENCES user_wallets(user_identifier)
);

-- Indexes for sessions
CREATE INDEX idx_session_user ON chat_sessions(user_identifier);
CREATE INDEX idx_session_created ON chat_sessions(created_at);

-- Chat messages table
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to chat_sessions
  FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for messages
CREATE INDEX idx_message_session ON chat_messages(session_id);
CREATE INDEX idx_message_created ON chat_messages(created_at);

-- Note: Supabase handles user permissions through its dashboard
-- No need to create users via SQL 