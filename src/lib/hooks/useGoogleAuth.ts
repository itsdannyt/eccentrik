import { useState, useCallback } from 'react';

// Make sure this matches exactly with your .env.local
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:5174/auth/callback';

if (!GOOGLE_CLIENT_ID) {
  console.error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
}

interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface UseGoogleAuthProps {
  onSuccess: (response: GoogleAuthResponse) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const initiateAuth = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError?.(new Error('Google Client ID is not configured'));
      return;
    }

    setIsAuthenticating(true);

    // Define required scopes for YouTube access
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube'
    ];
    const scope = encodeURIComponent(scopes.join(' '));
    
    // Generate and store state
    const state = Math.random().toString(36).substring(7);
    try {
      // Store state in localStorage instead of sessionStorage
      localStorage.setItem('oauth_state', state);
      
      // Also store a timestamp to expire old states
      localStorage.setItem('oauth_state_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to store OAuth state:', error);
      onError?.(new Error('Failed to initialize authentication'));
      return;
    }

    // Construct auth URL with correct parameters
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;

    window.location.href = authUrl;
  }, [onError]);

  const handleCallback = useCallback(async (params: URLSearchParams) => {
    try {
      const storedState = localStorage.getItem('oauth_state');
      const stateTimestamp = parseInt(localStorage.getItem('oauth_state_timestamp') || '0');
      const returnedState = params.get('state');

      // Clear stored state
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_state_timestamp');

      // Verify state is valid and not expired (30 minutes max)
      const stateAge = Date.now() - stateTimestamp;
      if (!storedState || storedState !== returnedState || stateAge > 30 * 60 * 1000) {
        throw new Error('Invalid or expired state parameter');
      }

      const code = params.get('code');
      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        console.error('Token exchange failed:', errorData);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();
      
      const response: GoogleAuthResponse = {
        access_token: tokens.access_token,
        token_type: 'Bearer',
        expires_in: tokens.expires_in,
        scope: tokens.scope,
      };

      await onSuccess(response);
    } catch (error) {
      console.error('Auth callback error:', error);
      onError?.(error instanceof Error ? error : new Error('Authentication failed'));
    } finally {
      setIsAuthenticating(false);
    }
  }, [onSuccess, onError]);

  return {
    initiateAuth,
    handleCallback,
    isAuthenticating
  };
}
