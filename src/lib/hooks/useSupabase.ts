import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export function useSupabase() {
  const supabase = useMemo(() => {
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw error;
    }
  }, []);

  return { supabase };
}
