import { ChatMessage, ChatSession } from '@/types';
import { randomUUID } from 'crypto';

// In-memory storage for development
// In production, replace with database (PostgreSQL, MongoDB, etc.)
class ChatStorage {
  private sessions: Map<string, ChatSession> = new Map();
  private userSessions: Map<string, string[]> = new Map();

  // Create a new chat session
  async createSession(userId: string, walletAddress: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: randomUUID(),
      userId,
      walletAddress,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(session.id, session);
    
    // Track user's sessions
    const userSessionIds = this.userSessions.get(userId) || [];
    userSessionIds.push(session.id);
    this.userSessions.set(userId, userSessionIds);

    return session;
  }

  // Add message to session
  async addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const fullMessage: ChatMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date()
    };

    session.messages.push(fullMessage);
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    return fullMessage;
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  // Get all sessions for a user
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const sessionIds = this.userSessions.get(userId) || [];
    const sessions: ChatSession[] = [];

    for (const id of sessionIds) {
      const session = this.sessions.get(id);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get recent messages for a user across all sessions
  async getRecentMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const sessions = await this.getUserSessions(userId);
    const allMessages: ChatMessage[] = [];

    for (const session of sessions) {
      allMessages.push(...session.messages);
    }

    return allMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Delete old sessions (for cleanup)
  async deleteOldSessions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;

    for (const [sessionId, session] of this.sessions) {
      if (session.updatedAt < cutoffDate) {
        this.sessions.delete(sessionId);
        
        // Remove from user sessions
        const userSessionIds = this.userSessions.get(session.userId) || [];
        const filtered = userSessionIds.filter(id => id !== sessionId);
        if (filtered.length > 0) {
          this.userSessions.set(session.userId, filtered);
        } else {
          this.userSessions.delete(session.userId);
        }
        
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Export sessions for backup
  async exportUserData(userId: string): Promise<{
    sessions: ChatSession[];
    exportDate: Date;
  }> {
    const sessions = await this.getUserSessions(userId);
    return {
      sessions,
      exportDate: new Date()
    };
  }
}

// Singleton instance
export const chatStorage = new ChatStorage();

// Helper functions for easy use
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  userId: string,
  metadata?: any
): Promise<ChatMessage> {
  return chatStorage.addMessage(sessionId, {
    userId,
    role,
    content,
    metadata
  });
}

export async function startChatSession(
  userId: string,
  walletAddress: string
): Promise<string> {
  const session = await chatStorage.createSession(userId, walletAddress);
  return session.id;
} 