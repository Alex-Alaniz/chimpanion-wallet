// Privy configuration constants
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Get the correct app URL
const appUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Privy configuration object
export const privyConfig = {
  // Configure authentication methods
  loginMethods: ['twitter' as const],
  
  // Enable server wallet functionality  
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' as const,
    requireUserPasswordOnCreate: false
  },

  // UI customization
  appearance: {
    theme: 'light' as const,
    accentColor: '#3B82F6', // Chimpanion blue
    logo: '/chimpanion-logo-placeholder.svg',
    showWalletLoginFirst: false
  },

  // Configure legal and terms
  legal: {
    termsAndConditionsUrl: `${appUrl}/terms`,
    privacyPolicyUrl: `${appUrl}/privacy`,
  },

  // Add Twitter-specific configuration
  twitter: {
    redirectUrl: 'https://auth.privy.io/api/v1/oauth/callback',
    scopes: ['tweet.read', 'users.read', 'offline.access']
  },

  // Fix WalletConnect metadata URL
  walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
};

export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

// Helper function to get user profile from Privy
export function extractTwitterProfile(user: any) {
  const twitterAccount = user?.linkedAccounts?.find((account: any) => account.type === 'twitter');
  
  if (!twitterAccount) {
    throw new Error('No Twitter account linked');
  }

  return {
    twitterId: twitterAccount.subject,
    twitterHandle: twitterAccount.username,
    twitterDisplayName: twitterAccount.name,
    profileImageUrl: twitterAccount.profilePictureUrl,
  };
}

// Helper function to extract wallet information
export function extractWalletInfo(user: any) {
  const embeddedWallet = user?.wallet;
  
  if (!embeddedWallet) {
    throw new Error('No embedded wallet found');
  }

  return {
    address: embeddedWallet.address,
    walletType: embeddedWallet.walletClientType,
    chainType: embeddedWallet.chainType,
  };
} 