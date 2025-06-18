import { NextRequest, NextResponse } from 'next/server';
import { 
  checkPremiumSubscription, 
  createSubscription, 
  verifySubscriptionPayment,
  formatSubscriptionStatus 
} from '@/lib/membership-utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userIdentifier = searchParams.get('user');
  
  if (!userIdentifier) {
    return NextResponse.json(
      { error: 'User identifier required' },
      { status: 400 }
    );
  }
  
  try {
    const subscription = await checkPremiumSubscription(userIdentifier);
    
    return NextResponse.json({
      subscription,
      status: formatSubscriptionStatus(subscription),
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdentifier, transactionHash, chain, paymentMethod = 'crypto' } = body;
    
    if (!userIdentifier || !transactionHash || !chain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify the payment on-chain
    const verification = await verifySubscriptionPayment(transactionHash, chain);
    
    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
    
    // Create the subscription
    const subscription = await createSubscription(
      userIdentifier,
      paymentMethod,
      transactionHash
    );
    
    return NextResponse.json({
      success: true,
      subscription,
      message: '🎉 Premium subscription activated successfully!',
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 