'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID, privyConfig } from '@/lib/privy';
import { ActivityProvider } from '@/lib/activity-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  if (!PRIVY_APP_ID) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not defined');
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        ...privyConfig,
        appearance: {
          ...privyConfig.appearance,
          accentColor: privyConfig.appearance.accentColor as `#${string}`,
        }
      }}
    >
      <ActivityProvider>
        {children}
      </ActivityProvider>
    </PrivyProvider>
  );
} 