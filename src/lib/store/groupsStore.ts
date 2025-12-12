/**
 * PrismSplit Groups Store
 * 
 * Manages groups, members, and group-related state.
 */

import { create } from 'zustand';

import type { Group, GroupMember, Currency } from '@/types/models';
import { demoGroups, demoGroupMembers } from '@/lib/api/demo';

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
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ groups: demoGroups, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch groups', isLoading: false });
    }
  },

  // Fetch single group by ID
  fetchGroupById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const group = demoGroups.find(g => g.id === id);
      if (group) {
        set({ currentGroup: group, isLoading: false });
      } else {
        set({ error: 'Group not found', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch group', isLoading: false });
    }
  },

  // Fetch members for a group
  fetchGroupMembers: async (groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const groupMembers = demoGroupMembers[groupId] || [];
      set(state => ({
        members: { ...state.members, [groupId]: groupMembers }
      }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  },

  // Create new group
  createGroup: async (name: string, emoji: string, currency: Currency) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name,
        emoji,
        currency,
        member_count: 1,
        your_balance: 0,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      set(state => ({
        groups: [newGroup, ...state.groups],
        isLoading: false,
      }));
      
      return newGroup;
    } catch (error) {
      set({ error: 'Failed to create group', isLoading: false });
      throw error;
    }
  },

  // Update group
  updateGroup: async (id: string, updates: Partial<Group>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groups: state.groups.map(g => 
          g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
        ),
        currentGroup: state.currentGroup?.id === id 
          ? { ...state.currentGroup, ...updates, updated_at: new Date().toISOString() }
          : state.currentGroup,
      }));
    } catch (error) {
      set({ error: 'Failed to update group' });
    }
  },

  // Delete group
  deleteGroup: async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groups: state.groups.filter(g => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      }));
    } catch (error) {
      set({ error: 'Failed to delete group' });
    }
  },

  // Leave group
  leaveGroup: async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groups: state.groups.filter(g => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      }));
    } catch (error) {
      set({ error: 'Failed to leave group' });
    }
  },

  // Join group via invite code
  joinGroup: async (code: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, return first group
      const group = demoGroups[0];
      
      set(state => ({
        groups: state.groups.some(g => g.id === group.id) 
          ? state.groups 
          : [group, ...state.groups],
        isLoading: false,
      }));
      
      return group;
    } catch (error) {
      set({ error: 'Invalid invite code', isLoading: false });
      throw error;
    }
  },

  // Set current group
  setCurrentGroup: (group: Group | null) => {
    set({ currentGroup: group });
  },
}));
