/**
 * PrismSplit Balances Store
 * 
 * Manages user balance state from Supabase user_balances table.
 * Provides real-time balance updates via Supabase Realtime subscriptions.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface UserBalance {
  groupId: string | null;
  groupName: string | null;
  groupEmoji: string | null;
  currency: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserColorIndex: number;
  balance: number;
}

interface GroupBalance {
  groupId: string;
  groupName: string;
  groupEmoji: string;
  currency: string;
  netBalance: number;
  withFriends: Record<string, {
    name: string;
    colorIndex: number;
    balance: number;
  }>;
}

interface FriendBalance {
  userId: string;
  name: string;
  colorIndex: number;
  balance: number;
}

interface BalancesState {
  // State
  groupBalances: Record<string, GroupBalance>;
  friendBalances: Record<string, FriendBalance>;
  netBalance: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAllBalances: () => Promise<void>;
  fetchBalancesForGroup: (groupId: string) => Promise<void>;
  getGroupBalance: (groupId: string) => GroupBalance | null;
  getFriendBalance: (userId: string) => FriendBalance | null;
  subscribeToBalances: () => () => void;
  clearBalances: () => void;
}

export const useBalancesStore = create<BalancesState>((set, get) => ({
  // Initial state
  groupBalances: {},
  friendBalances: {},
  netBalance: 0,
  isLoading: false,
  error: null,

  // Fetch all balances for current user
  fetchAllBalances: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .rpc('get_user_balances', { p_user_id: session.user.id });

      if (error) throw error;

      // Process balances into structured format
      const groupBalances: Record<string, GroupBalance> = {};
      const friendBalances: Record<string, FriendBalance> = {};
      let netBalance = 0;

      (data || []).forEach((row: any) => {
        const balance: UserBalance = {
          groupId: row.group_id,
          groupName: row.group_name,
          groupEmoji: row.group_emoji,
          currency: row.currency,
          otherUserId: row.other_user_id,
          otherUserName: row.other_user_name,
          otherUserColorIndex: row.other_user_color_index,
          balance: parseFloat(row.balance),
        };

        if (balance.groupId) {
          // Group-specific balance
          if (!groupBalances[balance.groupId]) {
            groupBalances[balance.groupId] = {
              groupId: balance.groupId,
              groupName: balance.groupName || '',
              groupEmoji: balance.groupEmoji || '💸',
              currency: balance.currency || 'USD',
              netBalance: 0,
              withFriends: {},
            };
          }
          
          groupBalances[balance.groupId].netBalance += balance.balance;
          groupBalances[balance.groupId].withFriends[balance.otherUserId] = {
            name: balance.otherUserName,
            colorIndex: balance.otherUserColorIndex,
            balance: balance.balance,
          };
        } else {
          // Cross-group balance (friend total)
          friendBalances[balance.otherUserId] = {
            userId: balance.otherUserId,
            name: balance.otherUserName,
            colorIndex: balance.otherUserColorIndex,
            balance: balance.balance,
          };
          netBalance += balance.balance;
        }
      });

      set({
        groupBalances,
        friendBalances,
        netBalance,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      set({ error: 'Failed to fetch balances', isLoading: false });
    }
  },

  // Fetch balances for a specific group
  fetchBalancesForGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('user_balances')
        .select(`
          balance,
          other_user_id,
          profiles!user_balances_other_user_id_fkey (
            full_name,
            color_index
          ),
          groups!user_balances_group_id_fkey (
            name,
            emoji,
            currency
          )
        `)
        .eq('user_id', session.user.id)
        .eq('group_id', groupId);

      if (error) throw error;

      const current = get().groupBalances;
      let groupBalance: GroupBalance | null = null;

      if (data && data.length > 0) {
        const firstRow = data[0] as any;
        groupBalance = {
          groupId,
          groupName: firstRow.groups?.name || '',
          groupEmoji: firstRow.groups?.emoji || '💸',
          currency: firstRow.groups?.currency || 'USD',
          netBalance: 0,
          withFriends: {},
        };

        data.forEach((row: any) => {
          const balance = parseFloat(row.balance);
          groupBalance!.netBalance += balance;
          groupBalance!.withFriends[row.other_user_id] = {
            name: row.profiles?.full_name || 'Unknown',
            colorIndex: row.profiles?.color_index || 0,
            balance,
          };
        });
      }

      set({
        groupBalances: groupBalance 
          ? { ...current, [groupId]: groupBalance }
          : current,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching group balances:', error);
      set({ error: 'Failed to fetch group balances', isLoading: false });
    }
  },

  // Get cached group balance
  getGroupBalance: (groupId: string) => {
    return get().groupBalances[groupId] || null;
  },

  // Get cached friend balance
  getFriendBalance: (userId: string) => {
    return get().friendBalances[userId] || null;
  },

  // Subscribe to real-time balance updates
  subscribeToBalances: () => {
    const channel = supabase
      .channel('balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balances',
        },
        (payload) => {
          // Refetch all balances when any change occurs
          get().fetchAllBalances();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Clear all balance data (e.g., on logout)
  clearBalances: () => {
    set({
      groupBalances: {},
      friendBalances: {},
      netBalance: 0,
      error: null,
    });
  },
}));
