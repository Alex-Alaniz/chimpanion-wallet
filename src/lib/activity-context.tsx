'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Activity {
  id: string;
  type: 'swap' | 'bridge' | 'send' | 'receive' | 'deploy' | 'transfer';
  description: string;
  amount?: string;
  fromChain?: string;
  toChain?: string;
  txHash?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  walletAddress?: string;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  updateActivityStatus: (id: string, status: Activity['status'], txHash?: string) => void;
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load activities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chimpanion_activities');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const activities = parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
        setActivities(activities);
      } catch (error) {
        console.error('Failed to load activities from storage:', error);
      }
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chimpanion_activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
  }, []);

  const updateActivityStatus = useCallback((id: string, status: Activity['status'], txHash?: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, status, ...(txHash && { txHash }) }
          : activity
      )
    );
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem('chimpanion_activities');
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, addActivity, updateActivityStatus, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
} 