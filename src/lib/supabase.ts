/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client with EncryptedStorage for auth token storage.
 * Uses Android Keystore / iOS Keychain for secure, encrypted storage with no size limit.
 */

import 'react-native-url-polyfill/auto';
import { createClient, Session } from '@supabase/supabase-js';
import EncryptedStorage from 'react-native-encrypted-storage';

// EncryptedStorage adapter for Supabase Auth
// Uses native Android Keystore / iOS Keychain for encryption
const encryptedStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('EncryptedStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error('EncryptedStorage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('EncryptedStorage removeItem error:', error);
    }
  },
};

// Initialize Supabase Client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: encryptedStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Initialize session from storage on app start
// This ensures the JWT is loaded before making database requests
let sessionInitialized = false;

export async function initializeSession(): Promise<Session | null> {
  if (sessionInitialized) {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Failed to initialize session:', error);
      return null;
    }
    sessionInitialized = true;
    // console.log('Session initialized:', data.session?.user?.email || 'No session');
    return data.session;
  } catch (error) {
    console.error('Session initialization error:', error);
    return null;
  }
}

// Helper to ensure session is loaded before making queries
export async function ensureSession(): Promise<boolean> {
  const session = await initializeSession();
  return session !== null;
}
