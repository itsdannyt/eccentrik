import { useState, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

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
    setIsAuthenticating(true);

    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly');
    const state = Math.random().toString(36).substring(7);
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('oauth_state', state);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=token` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&prompt=consent` +
      `&access_type=offline`;

    window.location.href = authUrl;
  }, []);

  const handleCallback = useCallback(async (params: URLSearchParams) => {
    try {
      const storedState = sessionStorage.getItem('oauth_state');
      const returnedState = params.get('state');

      if (!storedState || storedState !== returnedState) {
        throw new Error('Invalid state parameter');
      }

      const accessToken = params.get('access_token');
      if (!accessToken) {
        throw new Error('No access token received');
      }

      const response: GoogleAuthResponse = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: parseInt(params.get('expires_in') || '3600'),
        scope: params.get('scope') || '',
      };

      await onSuccess(response);
    } catch (error) {
      console.error('Auth callback error:', error);
      onError?.(error instanceof Error ? error : new Error('Authentication failed'));
    } finally {
      setIsAuthenticating(false);
      sessionStorage.removeItem('oauth_state');
    }
  }, [onSuccess, onError]);

  return {
    initiateAuth,
    handleCallback,
    isAuthenticating
  };
}
