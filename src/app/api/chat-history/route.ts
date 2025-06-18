import { NextRequest, NextResponse } from 'next/server';
import { chatStorage } from '@/lib/chat-storage';
import { checkPremiumMembership } from '@/lib/membership-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('wallet');
    const sessionId = searchParams.get('sessionId');
    
    if (!userId || !walletAddress) {
      return NextResponse.json(
        { error: 'User ID and wallet address are required' },
        { status: 400 }
      );
    }

    // Check premium membership
    const membership = await checkPremiumMembership(walletAddress, userId);
    if (membership.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Premium membership required',
          membership,
          message: 'Chat history is only available for premium members with $20+ in $APES tokens'
        },
        { status: 403 }
      );
    }

    // Get specific session or all sessions
    if (sessionId) {
      const session = await chatStorage.getSession(sessionId);
      if (!session || session.userId !== userId) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    } else {
      const sessions = await chatStorage.getUserSessions(userId);
      const recentMessages = await chatStorage.getRecentMessages(userId, 100);
      return NextResponse.json({
        sessions,
        recentMessages,
        totalSessions: sessions.length
      });
    }
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, walletAddress, sessionId, message } = await request.json();
    
    if (!userId || !walletAddress) {
      return NextResponse.json(
        { error: 'User ID and wallet address are required' },
        { status: 400 }
      );
    }

    // Check premium membership
    const membership = await checkPremiumMembership(walletAddress, userId);
    if (membership.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Premium membership required',
          membership,
          message: 'Chat history is only available for premium members with $20+ in $APES tokens'
        },
        { status: 403 }
      );
    }

    switch (action) {
      case 'createSession':
        const newSession = await chatStorage.createSession(userId, walletAddress);
        return NextResponse.json({ sessionId: newSession.id });
        
      case 'addMessage':
        if (!sessionId || !message) {
          return NextResponse.json(
            { error: 'Session ID and message are required' },
            { status: 400 }
          );
        }
        const savedMessage = await chatStorage.addMessage(sessionId, message);
        return NextResponse.json({ message: savedMessage });
        
      case 'export':
        const exportData = await chatStorage.exportUserData(userId);
        return NextResponse.json(exportData);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 