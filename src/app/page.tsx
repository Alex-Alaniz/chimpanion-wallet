'use client';

import { usePrivy } from '@privy-io/react-auth';
import { ChimpanionLandingPage } from '@/components/ChimpanionLandingPage';
import ChimpanionMainPage from '@/components/ChimpanionMainPage';

// Disable static optimization for this page since it uses Privy
export const dynamic = 'force-dynamic';

export default function Home() {
  const { authenticated, login } = usePrivy();

  if (!authenticated) {
    return <ChimpanionLandingPage onLogin={login} />;
  }

  return <ChimpanionMainPage />;
}
