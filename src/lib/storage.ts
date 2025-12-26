/**
 * PrismSplit Storage Utilities
 * 
 * Provides storage adapters for Zustand persist middleware:
 * - AsyncStorage: General cache for non-sensitive data (theme, UI state)
 * - EncryptedStorage: Secure storage for sensitive data (user info, auth state)
 * 
 * Note: MMKV was removed due to compatibility issues with RN 0.81 + New Architecture.
 * Can revisit when MMKV has better support for this stack.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { StateStorage } from 'zustand/middleware';

/**
 * AsyncStorage Adapter for Zustand
 * 
 * Use for non-sensitive data like theme preferences and UI state.
 */
export const asyncStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value ?? null;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },
};

/**
 * Encrypted Storage Adapter for Zustand
 * 
 * Use for sensitive data like user info and authentication state.
 * Uses native Android Keystore / iOS Keychain for encryption.
 */
export const encryptedStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await EncryptedStorage.getItem(name);
      return value ?? null;
    } catch (error) {
      console.error('EncryptedStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(name, value);
    } catch (error) {
      console.error('EncryptedStorage setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await EncryptedStorage.removeItem(name);
    } catch (error) {
      console.error('EncryptedStorage removeItem error:', error);
    }
  },
};
