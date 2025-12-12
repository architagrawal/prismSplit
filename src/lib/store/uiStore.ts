/**
 * PrismSplit UI Store
 * 
 * Manages UI state like theme, modals, and navigation.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Loading states
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown>;
  openModal: (name: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Keyboard
  keyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme: Theme) => set({ theme }),

      // Loading
      isGlobalLoading: false,
      setGlobalLoading: (loading: boolean) => set({ isGlobalLoading: loading }),

      // Modals
      activeModal: null,
      modalData: {},
      openModal: (name: string, data: Record<string, unknown> = {}) => {
        set({ activeModal: name, modalData: data });
      },
      closeModal: () => {
        set({ activeModal: null, modalData: {} });
      },

      // Toasts
      toasts: [],
      showToast: (toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString();
        const newToast = { ...toast, id };
        
        set(state => ({
          toasts: [...state.toasts, newToast]
        }));

        // Auto-dismiss
        const duration = toast.duration || 3000;
        setTimeout(() => {
          get().dismissToast(id);
        }, duration);
      },
      dismissToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      clearSearch: () => set({ searchQuery: '' }),

      // Keyboard
      keyboardVisible: false,
      setKeyboardVisible: (visible: boolean) => set({ keyboardVisible: visible }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
