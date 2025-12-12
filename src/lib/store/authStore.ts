/**
 * PrismSplit Auth Store
 * 
 * Manages user authentication state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/types/models';
import { currentUser } from '@/lib/api/demo';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasOnboarded: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setOnboarded: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasOnboarded: false,

      // Login with email/password
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo, use mock user
        set({ 
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Login with Google OAuth
      loginWithGoogle: async () => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ 
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Signup
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newUser: User = {
          id: 'new-user-id',
          email,
          full_name: name,
          avatar_url: null,
          color_index: 0,
          created_at: new Date().toISOString(),
        };
        
        set({ 
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Logout
      logout: () => {
        set({ 
          user: null,
          isAuthenticated: false,
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
        }
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
    }
  )
);
