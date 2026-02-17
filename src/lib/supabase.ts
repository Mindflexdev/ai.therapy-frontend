import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use custom domain if set in env, otherwise fallback to Supabase default
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://app.ai.therapy.free';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJyaWVwbW5wcW91dGR4dWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDIyNTEsImV4cCI6MjA4Njc3ODI1MX0.ShLuwWwgJojhWW514IREdjBczGOYvZX6MJKhKUehJYs';

// On web, use localStorage directly (synchronous) instead of AsyncStorage.
// AsyncStorage on web wraps localStorage in Promises, which can cause timing
// issues during OAuth redirects where the page fully reloads.
const webStorage = {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: (key: string) => window.localStorage.removeItem(key),
};

const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
    },
});
