import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
const serverStorage = new Map<string, string>();

const storage = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return serverStorage.get(key) ?? null;
    }

    if (typeof window.localStorage !== 'undefined') {
      return window.localStorage.getItem(key);
    }

    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined') {
      serverStorage.set(key, value);
      return;
    }

    if (typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined') {
      serverStorage.delete(key);
      return;
    }

    if (typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});