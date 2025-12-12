/**
 * PrismSplit Activity Store
 * 
 * Manages activity feed and notifications.
 */

import { create } from 'zustand';

import type { Activity } from '@/types/models';
import { demoActivities } from '@/lib/api/demo';

interface ActivityState {
  // State
  activities: Activity[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: () => Promise<void>;
  fetchActivitiesByGroup: (groupId: string) => Promise<void>;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  // Initial state
  activities: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Fetch all activities
  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        activities: demoActivities,
        unreadCount: demoActivities.filter(a => !a.is_read).length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch activities', isLoading: false });
    }
  },

  // Fetch activities for a specific group
  fetchActivitiesByGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const groupActivities = demoActivities.filter(a => a.group.id === groupId);
      set({ activities: groupActivities, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch activities', isLoading: false });
    }
  },

  // Mark single activity as read
  markAsRead: (activityId: string) => {
    set(state => {
      const activities = state.activities.map(a => 
        a.id === activityId ? { ...a, is_read: true } : a
      );
      return { 
        activities,
        unreadCount: activities.filter(a => !a.is_read).length,
      };
    });
  },

  // Mark all as read
  markAllAsRead: () => {
    set(state => ({
      activities: state.activities.map(a => ({ ...a, is_read: true })),
      unreadCount: 0,
    }));
  },

  // Clear all activities
  clearActivities: () => {
    set({ activities: [], unreadCount: 0 });
  },
}));
