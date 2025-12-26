/**
 * PrismSplit Activity Store
 * 
 * Manages activity feed from Supabase activity_logs table.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types/models';

interface ActivityState {
  // State
  activities: Activity[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: () => Promise<void>;
  fetchActivitiesByGroup: (groupId: string) => Promise<void>;
  markAsRead: (activityId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearActivities: () => void;
  subscribeToActivities: () => () => void;
}

// Map database row to Activity type
const mapActivity = (row: any): Activity => ({
  id: row.id,
  group: {
    id: row.group_id,
    name: row.groups?.name || '',
    emoji: row.groups?.emoji || '💸',
  },
  user: {
    id: row.user_id,
    full_name: row.profiles?.full_name || 'Unknown',
    avatar_url: row.profiles?.avatar_url || null,
    color_index: row.profiles?.color_index || 0,
  },
  type: row.activity_type,
  entity_type: row.entity_type,
  entity_id: row.entity_id,
  metadata: row.metadata || {},
  is_read: row.is_read || false,
  created_at: row.created_at,
});

export const useActivityStore = create<ActivityState>((set, get) => ({
  // Initial state
  activities: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Fetch all activities for user's groups
  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isLoading: false });
        return;
      }

      // Get activities from all groups the user is a member of
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          groups!activity_logs_group_id_fkey (
            name,
            emoji
          ),
          profiles!activity_logs_user_id_fkey (
            full_name,
            avatar_url,
            color_index
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const activities = (data || []).map(mapActivity);
      set({ 
        activities,
        unreadCount: activities.filter(a => !a.is_read).length,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ error: 'Failed to fetch activities', isLoading: false });
    }
  },

  // Fetch activities for a specific group
  fetchActivitiesByGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          groups!activity_logs_group_id_fkey (
            name,
            emoji
          ),
          profiles!activity_logs_user_id_fkey (
            full_name,
            avatar_url,
            color_index
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const activities = (data || []).map(mapActivity);
      set({ activities, isLoading: false });
    } catch (error) {
      console.error('Error fetching group activities:', error);
      set({ error: 'Failed to fetch activities', isLoading: false });
    }
  },

  // Mark single activity as read
  markAsRead: async (activityId: string) => {
    // Optimistic update
    set(state => {
      const activities = state.activities.map(a => 
        a.id === activityId ? { ...a, is_read: true } : a
      );
      return { 
        activities,
        unreadCount: activities.filter(a => !a.is_read).length,
      };
    });

    // Sync to Supabase
    try {
      await supabase
        .from('activity_logs')
        .update({ is_read: true })
        .eq('id', activityId);
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    const { activities } = get();
    const unreadIds = activities.filter(a => !a.is_read).map(a => a.id);
    
    if (unreadIds.length === 0) return;

    // Optimistic update
    set(state => ({
      activities: state.activities.map(a => ({ ...a, is_read: true })),
      unreadCount: 0,
    }));

    // Sync to Supabase
    try {
      await supabase
        .from('activity_logs')
        .update({ is_read: true })
        .in('id', unreadIds);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  // Clear all activities
  clearActivities: () => {
    set({ activities: [], unreadCount: 0 });
  },

  // Subscribe to real-time activity updates
  subscribeToActivities: () => {
    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        (_payload) => {
          // Refetch activities when new ones are added
          get().fetchActivities();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
