/**
 * PrismSplit Auth Store
 * 
 * Manages user authentication state using Supabase.
 * Uses AsyncStorage for state persistence (Zustand).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { loginInputSchema, signupInputSchema, validateInput } from '@/lib/validation';
import type { User } from '@/types/models';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasOnboarded: boolean;
  _hasHydrated: boolean; // Tracks if persisted state has loaded

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setOnboarded: () => void;
  updateProfile: (updates: Partial<User>) => void;
  refreshSession: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

// Helper to map Supabase User to App User
const mapSupabaseUser = (sbUser: any): User => {
  return {
    id: sbUser.id,
    email: sbUser.email!,
    full_name: sbUser.user_metadata?.full_name || 'Friend',
    avatar_url: sbUser.user_metadata?.avatar_url || null,
    color_index: sbUser.user_metadata?.color_index || 0,
    created_at: sbUser.created_at,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasOnboarded: false,
      _hasHydrated: false,

      // Login with email/password
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Validate input
        const validation = validateInput(loginInputSchema, { email, password });
        if (!validation.success) {
          set({ isLoading: false });
          throw new Error(validation.error);
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        if (data.user) {
          set({ 
            user: mapSupabaseUser(data.user),
            isAuthenticated: true,
            isLoading: false,
          });
        }
      },

      // Login with Google OAuth
      loginWithGoogle: async () => {
        set({ isLoading: true });
        
        // TODO: Implement Expo Google Sign-In flow
        // passing OAuth token to Supabase
        
        console.warn("Google Login not yet implemented in Backend");
        set({ isLoading: false });
      },

      // Signup
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        // Validate input
        const validation = validateInput(signupInputSchema, { email, password, fullName: name });
        if (!validation.success) {
          set({ isLoading: false });
          throw new Error(validation.error);
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
          options: {
            data: {
              full_name: validation.data.fullName,
              color_index: Math.floor(Math.random() * 6), // Random color 0-5
            },
          },
        });

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        // Note: If email confirmation is enabled, user might be null here
        // or session might be null. For now assume auto-confirm or session handling.
        if (data.user) {
           set({ 
            user: mapSupabaseUser(data.user),
            isAuthenticated: true, // If email confirm is on, this might need to be false
            isLoading: false,
          });
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ 
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Mark onboarding complete
      setOnboarded: () => {
        set({ hasOnboarded: true });
      },

      // Update user profile
      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
          // TODO: Sync to Supabase
          /*
          supabase.auth.updateUser({
            data: { ...updates }
          });
          */
        }
      },

      refreshSession: async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
           set({ 
            user: mapSupabaseUser(data.session.user),
            isAuthenticated: true 
          });
        } else {
           // set({ user: null, isAuthenticated: false });
        }
      },

      // Set hydration state (called when persisted state is loaded)
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasOnboarded: state.hasOnboarded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
