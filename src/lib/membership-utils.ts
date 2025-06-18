import { MEMBERSHIP_CONFIG, PremiumSubscription } from '@/types';

// Treasury wallet for subscription payments (Solana only)
const TREASURY_WALLET_SOLANA = 'TREASURY11111111111111111111111111111111111'; // TODO: Replace with actual treasury address

// PRIMEAPE token details
const PRIMEAPE_TOKEN = {
  address: '9BZJXtmfPpkHnM57gHEx5Pc9oQhLhJtr4mhCsNtttTts',
  decimals: 9,
  symbol: 'APES',
  name: 'PRIMEAPE',
};

// Subscription pricing model
const SUBSCRIPTION_PRICING = {
  apes: {
    amount: 21,        // $21 when paying with APES (30% discount)
    currency: 'USD',
    discount: 0.30,    // 30% discount
  },
  standard: {
    amount: 30,        // $30 for other payment methods
    currency: 'USD',
    upcharge: 0.30,    // 30% upcharge (difference goes to buying APES)
  },
  base: 30,           // Base price before discounts/upcharges
};

// Mock subscription database - in production, use a real database
const subscriptionDatabase = new Map<string, PremiumSubscription>();

// Check if user has active premium subscription
export async function checkPremiumSubscription(
  userIdentifier: string
): Promise<PremiumSubscription> {
  // In production, check a real database or payment processor
  const existingSubscription = subscriptionDatabase.get(userIdentifier);
  
  if (existingSubscription && existingSubscription.status === 'active') {
    // Check if subscription has expired
    const now = new Date();
    if (existingSubscription.expiresAt && existingSubscription.expiresAt < now) {
      existingSubscription.status = 'expired';
      subscriptionDatabase.set(userIdentifier, existingSubscription);
    }
  }
  
  return existingSubscription || {
    userId: userIdentifier,
    status: 'inactive',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Create or update subscription
export async function createSubscription(
  userIdentifier: string,
  paymentMethod: 'crypto' | 'card',
  transactionHash?: string,
  paymentToken?: string // 'APES' or other
): Promise<PremiumSubscription> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription
  
  // Determine amount based on payment method
  const isApesPayment = paymentToken === 'APES';
  const amount = isApesPayment ? SUBSCRIPTION_PRICING.apes.amount : SUBSCRIPTION_PRICING.standard.amount;
  
  const subscription: PremiumSubscription = {
    userId: userIdentifier,
    status: 'active',
    plan: 'monthly',
    amount,
    currency: 'USD',
    paymentMethod,
    transactionHash,
    createdAt: now,
    updatedAt: now,
    expiresAt,
    autoRenew: false, // Default to manual renewal
  };
  
  subscriptionDatabase.set(userIdentifier, subscription);
  return subscription;
}

// Cancel subscription
export async function cancelSubscription(
  userIdentifier: string
): Promise<boolean> {
  const subscription = subscriptionDatabase.get(userIdentifier);
  if (subscription) {
    subscription.status = 'cancelled';
    subscription.updatedAt = new Date();
    subscription.autoRenew = false;
    subscriptionDatabase.set(userIdentifier, subscription);
    return true;
  }
  return false;
}

// Format subscription status for display
export function formatSubscriptionStatus(subscription: PremiumSubscription): string {
  if (subscription.status === 'active') {
    const daysLeft = subscription.expiresAt 
      ? Math.ceil((subscription.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    return `✅ Premium Active (${daysLeft} days remaining)`;
  } else if (subscription.status === 'expired') {
    return `⏰ Premium Expired (Renew for $21 with APES or $30 with other payment methods)`;
  } else {
    return `❌ Premium Inactive (Subscribe for $21/month with APES - Save 30%!)`;
  }
}

// Get subscription benefits
export function getSubscriptionBenefits(): string[] {
  return [
    '📝 Unlimited messages',
    '💸 50% lower transaction fees',
    '🚀 Priority support',
    '📊 Advanced trading features',
    '💾 Chat history & export',
    '🔔 Price alerts & notifications',
    '🎯 Custom trading strategies',
    '🌟 Early access to new features',
  ];
}

// Get treasury wallet (Solana only)
export function getTreasuryWallet(chain: 'base' | 'apechain' | 'solana' = 'solana'): string {
  // Always return Solana treasury wallet as we only accept payments on Solana
  return TREASURY_WALLET_SOLANA;
}

// Generate subscription payment instructions
export function generatePaymentInstructions(
  userIdentifier: string,
  paymentMethod: 'APES' | 'SOL' | 'USDC' = 'APES'
): {
  amount: string;
  recipient: string;
  memo: string;
  tokenAddress?: string;
  instructions: string[];
  savings?: string;
} {
  const treasuryWallet = getTreasuryWallet('solana');
  const isApesPayment = paymentMethod === 'APES';
  
  // Calculate amounts based on payment method
  let amount: string;
  let instructions: string[];
  let savings: string | undefined;
  
  if (isApesPayment) {
    // APES payment - $21 worth
    amount = '2100'; // Approximate amount in APES tokens (adjust based on current price)
    instructions = [
      `Send ${amount} APES tokens to the treasury wallet`,
      `Token address: ${PRIMEAPE_TOKEN.address}`,
      `Include the memo in your transaction`,
      `You save 30% by paying with APES!`,
      `Your subscription will activate within 1-2 minutes`,
    ];
    savings = '$9 (30% discount)';
  } else {
    // Other payment methods - $30
    if (paymentMethod === 'SOL') {
      amount = '0.15'; // Approximate $30 in SOL (adjust based on current price)
    } else {
      amount = '30'; // USDC
    }
    instructions = [
      `Send ${amount} ${paymentMethod} to the treasury wallet`,
      `The extra $9 will be used to purchase APES tokens`,
      `Include the memo in your transaction`,
      `Consider paying with APES to save 30%!`,
      `Your subscription will activate within 1-2 minutes`,
    ];
  }
  
  return {
    amount,
    recipient: treasuryWallet,
    memo: `SUB-${userIdentifier.slice(0, 8)}`,
    tokenAddress: isApesPayment ? PRIMEAPE_TOKEN.address : undefined,
    instructions,
    savings,
  };
}

// Get PRIMEAPE token info
export function getApesTokenInfo() {
  return {
    ...PRIMEAPE_TOKEN,
    solscanUrl: `https://solscan.io/token/${PRIMEAPE_TOKEN.address}`,
    pricing: {
      subscription: SUBSCRIPTION_PRICING.apes.amount,
      discount: `${SUBSCRIPTION_PRICING.apes.discount * 100}%`,
      standard: SUBSCRIPTION_PRICING.standard.amount,
    },
  };
}

// Verify subscription payment (mock - in production, check blockchain)
export async function verifySubscriptionPayment(
  transactionHash: string,
  chain: 'base' | 'apechain' | 'solana'
): Promise<{
  verified: boolean;
  amount?: number;
  sender?: string;
  paymentToken?: string;
}> {
  // In production, verify the transaction on-chain
  // Check if payment was made in APES or other tokens
  console.log(`Verifying payment ${transactionHash} on ${chain}`);
  
  // Mock implementation - in production, actually check the blockchain
  return {
    verified: true,
    amount: 21, // Assume APES payment for now
    sender: 'mock-sender-address',
    paymentToken: 'APES',
  };
}

// LEGACY: Check APES balance (keeping for backward compatibility)
export async function checkPremiumMembership(
  walletAddress: string,
  userId?: string
): Promise<any> {
  // Convert to new subscription model
  const subscription = await checkPremiumSubscription(userId || walletAddress);
  
  return {
    userId: userId || walletAddress,
    walletAddress,
    status: subscription.status === 'active' ? 'active' : 'expired',
    apesBalance: '0',
    apesValueUSD: 0,
    lastChecked: new Date(),
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    expiresAt: subscription.expiresAt,
  };
}

// LEGACY: Format membership status
export function formatMembershipStatus(membership: any): string {
  const subscription: PremiumSubscription = {
    userId: membership.userId,
    status: membership.status,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
    expiresAt: membership.expiresAt,
  };
  
  return formatSubscriptionStatus(subscription);
} 