'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, CreditCard, Check } from 'lucide-react';

interface Subscription {
  status: 'active' | 'expired' | 'cancelled' | 'inactive';
  expiresAt?: Date;
  plan?: string;
  benefits?: string[];
}

export function MembershipStatus() {
  const { user, ready } = usePrivy();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  const getUserIdentifier = () => {
    if (!user) return null;
    if (user.twitter?.username) return user.twitter.username;
    return user.email?.address || user.id;
  };

  const checkSubscription = async () => {
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/subscription?user=${encodeURIComponent(userIdentifier)}`);
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && user) {
      checkSubscription();
    }
  }, [ready, user]);

  if (!ready || !user) return null;

  const userIdentifier = getUserIdentifier();
  const daysLeft = subscription?.expiresAt 
    ? Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown className={`w-5 h-5 ${subscription?.status === 'active' ? 'text-yellow-500' : 'text-gray-500'}`} />
          <h3 className="text-lg font-semibold">Premium Subscription</h3>
        </div>
        <Button
          onClick={checkSubscription}
          disabled={loading}
          size="sm"
          variant="ghost"
          className="text-xs"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {subscription ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status:</span>
            <span className={`text-sm font-medium ${
              subscription.status === 'active' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {subscription.status === 'active' 
                ? `Active (${daysLeft} days left)`
                : subscription.status === 'expired'
                ? 'Expired'
                : 'Inactive'}
            </span>
          </div>

          {subscription.status === 'active' ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Premium Benefits:</p>
              <ul className="text-xs space-y-1 text-gray-300">
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-400" /> Unlimited messages</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-400" /> 50% lower transaction fees</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-400" /> Priority support</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-400" /> Advanced trading features</li>
                <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-400" /> Chat history & export</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm font-medium text-yellow-500">Premium Subscription</p>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400">Pay with $APES:</span>
                    <span className="font-bold text-green-400">$21/month</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Other methods:</span>
                    <span className="text-gray-400">$30/month</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mb-2">
                  Save 30% when you pay with PRIMEAPE tokens!
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-medium"
                  onClick={() => {
                    // Open chat with subscription command
                    const chatInput = document.querySelector('input[placeholder*="Ask me"]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = 'I want to subscribe with APES tokens';
                      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                      // Trigger form submit
                      const form = chatInput.closest('form');
                      if (form) {
                        form.dispatchEvent(new Event('submit', { bubbles: true }));
                      }
                    }
                  }}
                >
                  Subscribe with APES
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                All payments on Solana • Instant activation • Cancel anytime
              </p>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <p className="text-sm text-gray-400">Checking subscription status...</p>
      )}
    </div>
  );
} 