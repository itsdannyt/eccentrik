import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from '../hooks/useSupabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  youtubeToken: string | null;
  refreshUser: () => Promise<void>;
  setYoutubeToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const refreshUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      setSession(session);
      setUser(session?.user ?? null);
      
      // Get YouTube token from user_youtube_tokens table
      if (session?.user) {
        const { data: tokenData } = await supabase
          .from('user_youtube_tokens')
          .select('access_token')
          .eq('user_id', session.user.id)
          .single();
        
        if (tokenData?.access_token) {
          setYoutubeToken(tokenData.access_token);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh user'));
      setUser(null);
      setSession(null);
      setYoutubeToken(null);
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted, initializing...');
    let mounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('Error getting initial session:', error);
        setError(error);
        setLoading(false);
        return;
      }

      console.log('Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasYouTubeToken: !!session?.user?.user_metadata?.youtube_token
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.youtube_token) {
        console.log('Setting YouTube token from metadata');
        setYoutubeToken(session.user.user_metadata.youtube_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        hasYouTubeToken: !!session?.user?.user_metadata?.youtube_token
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.youtube_token) {
        console.log('Setting YouTube token from metadata after auth change');
        setYoutubeToken(session.user.user_metadata.youtube_token);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value = {
    user,
    session,
    loading,
    error,
    youtubeToken,
    refreshUser,
    setYoutubeToken
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we initialize your session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}