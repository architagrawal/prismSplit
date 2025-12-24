import { supabase } from '@/lib/supabase';
import type { 
  Group, 
  Bill,
  // BillSummary, // Use if needed
  User
} from '@/types/models';
import type { CreateGroupRequest } from '@/types';

/**
 * Typed API Wrapper for Supabase Tables
 * 
 * Centralizes all DB queries to ensure type safety and consistent error handling.
 */

export const api = {
  
  // === Groups ===
  
  groups: {
    list: async (): Promise<Group[]> => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Group[];
    },

    create: async (group: CreateGroupRequest): Promise<Group> => {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          emoji: group.emoji || '💸',
          currency: group.currency || 'USD',
          invite_code: crypto.randomUUID().slice(0, 6).toUpperCase() // Simple client-side gen for now
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as Group;
    },

    getById: async (id: string): Promise<Group | null> => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as Group;
    }
  },

  // === Bills ===

  bills: {
    listByGroup: async (groupId: string): Promise<Bill[]> => {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          payer:users(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('bill_date', { ascending: false });

      if (error) throw error;
      return data as unknown as Bill[]; // Type assertion needed due to join
    }
  },

  // === Users ===
  
  users: {
    profile: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')  // Fixed: was 'users', should be 'profiles'
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as User;
    }
  }
};
