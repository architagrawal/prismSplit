/**
 * PrismSplit Groups Store
 * 
 * Manages groups, members, and group-related state.
 * Connected to Supabase for persistent storage.
 */

import { create } from 'zustand';
import { supabase, ensureSession } from '@/lib/supabase';
import type { Group, GroupMember, Currency } from '@/types/models';

interface GroupsState {
  // State
  groups: Group[];
  currentGroup: Group | null;
  members: Record<string, GroupMember[]>; // groupId -> members
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  fetchGroupMembers: (groupId: string) => Promise<void>;
  createGroup: (name: string, emoji: string, currency: Currency) => Promise<Group>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  joinGroup: (code: string) => Promise<Group>;
  setCurrentGroup: (group: Group | null) => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  // Initial state
  groups: [],
  currentGroup: null,
  members: {},
  isLoading: false,
  error: null,

  // Fetch all groups for current user
  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ groups: [], isLoading: false });
        return;
      }

      // Get groups where user is a member, with member count
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group:groups (
            id,
            name,
            emoji,
            currency,
            invite_code,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform to Group format
      const groups: Group[] = (data || [])
        .filter((d: any) => d.group !== null)
        .map((d: any) => ({
          id: d.group.id,
          name: d.group.name,
          emoji: d.group.emoji,
          currency: d.group.currency,
          invite_code: d.group.invite_code,
          member_count: 0, // Will be fetched separately if needed
          your_balance: 0, // Calculated on demand
          created_at: d.group.created_at,
          updated_at: d.group.updated_at,
        }));

      set({ groups, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch groups:', error);
      set({ error: error.message || 'Failed to fetch groups', isLoading: false });
    }
  },

  // Fetch single group by ID
  fetchGroupById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const group: Group = {
        id: data.id,
        name: data.name,
        emoji: data.emoji,
        currency: data.currency,
        invite_code: data.invite_code,
        member_count: 0,
        your_balance: 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      set({ currentGroup: group, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch group:', error);
      set({ error: error.message || 'Group not found', isLoading: false });
    }
  },

  // Fetch members for a group
  fetchGroupMembers: async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          role,
          color_index,
          joined_at,
          user_id,
          user:profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const members: GroupMember[] = (data || []).map((m: any) => ({
        id: m.id,
        group_id: groupId,
        user_id: m.user_id,
        role: m.role,
        color_index: m.color_index,
        joined_at: m.joined_at,
        balance: 0, // Calculated on demand
        user: {
          id: m.user?.id || m.user_id,
          full_name: m.user?.full_name || 'Unknown',
          avatar_url: m.user?.avatar_url || null,
          email: m.user?.email || '',
          color_index: m.user?.color_index || 0,
          created_at: m.user?.created_at || new Date().toISOString(),
        },
      }));

      set(state => ({
        members: { ...state.members, [groupId]: members }
      }));
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
    }
  },

  // Create new group
  createGroup: async (name: string, emoji: string, currency: Currency) => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure session is loaded before making database request
      await ensureSession();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique invite code
      let inviteCode = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        // Generate a random 6-character alphanumeric code
        inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Check if code already exists
        const { data: existing, error: checkError } = await supabase
          .from('groups')
          .select('id')
          .eq('invite_code', inviteCode)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking invite code:', checkError);
        }
        
        // If no existing group with this code, it's unique
        isUnique = !existing;
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Failed to generate unique invite code');
      }

      // Use RPC function to create group (bypasses RLS timing issues)
      const { data: newGroupId, error: rpcError } = await supabase.rpc(
        'create_group_for_user',
        {
          p_name: name,
          p_emoji: emoji,
          p_currency: currency,
          p_invite_code: inviteCode,
          p_user_id: user.id,
        }
      );

      if (rpcError) throw rpcError;

      const group: Group = {
        id: newGroupId,
        name,
        emoji,
        currency,
        invite_code: inviteCode,
        member_count: 1,
        your_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set(state => ({
        groups: [group, ...state.groups],
        isLoading: false,
      }));

      return group;
    } catch (error: any) {
      console.error('Failed to create group:', error);
      set({ error: error.message || 'Failed to create group', isLoading: false });
      throw error;
    }
  },

  // Update group
  updateGroup: async (id: string, updates: Partial<Group>) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: updates.name,
          emoji: updates.emoji,
          currency: updates.currency,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        groups: state.groups.map(g => 
          g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
        ),
        currentGroup: state.currentGroup?.id === id 
          ? { ...state.currentGroup, ...updates, updated_at: new Date().toISOString() }
          : state.currentGroup,
      }));
    } catch (error: any) {
      console.error('Failed to update group:', error);
      set({ error: error.message || 'Failed to update group' });
    }
  },

  // Delete group (admin only)
  deleteGroup: async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        groups: state.groups.filter(g => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      }));
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      set({ error: error.message || 'Failed to delete group' });
    }
  },

  // Leave group
  leaveGroup: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      set(state => ({
        groups: state.groups.filter(g => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      }));
    } catch (error: any) {
      console.error('Failed to leave group:', error);
      set({ error: error.message || 'Failed to leave group' });
    }
  },

  // Join group via invite code
  joinGroup: async (code: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const searchCode = code.toUpperCase().trim();
      console.log('🔍 Joining group with code:', searchCode);

      // Use RPC function to join group (bypasses RLS)
      const { data, error: rpcError } = await supabase.rpc(
        'join_group_by_code',
        { p_invite_code: searchCode }
      );

      console.log('📦 RPC result:', { data, rpcError });

      if (rpcError) {
        console.error('❌ Failed to join:', rpcError);
        // Parse error message from RPC
        const errorMessage = rpcError.message || 'Failed to join group';
        throw new Error(
          errorMessage.includes('Invalid invite code') ? 'Invalid invite code' :
          errorMessage.includes('Already a member') ? 'Already a member of this group' :
          errorMessage
        );
      }

      // RPC returns an array with one row
      const groupInfo = Array.isArray(data) && data.length > 0 ? data[0] : data;
      
      if (!groupInfo || !groupInfo.group_id) {
        throw new Error('Failed to join group');
      }

      const group: Group = {
        id: groupInfo.group_id,
        name: groupInfo.group_name,
        emoji: groupInfo.group_emoji,
        currency: groupInfo.group_currency as Currency,
        invite_code: searchCode,
        member_count: 1,
        your_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set(state => ({
        groups: state.groups.some(g => g.id === group.id) 
          ? state.groups 
          : [group, ...state.groups],
        isLoading: false,
      }));

      console.log('✅ Successfully joined group:', group.name);
      return group;
    } catch (error: any) {
      console.error('Failed to join group:', error);
      set({ error: error.message || 'Invalid invite code', isLoading: false });
      throw error;
    }
  },

  // Set current group
  setCurrentGroup: (group: Group | null) => {
    set({ currentGroup: group });
  },
}));
