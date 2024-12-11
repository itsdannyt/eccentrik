import { useState, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = import.meta.env.VITE_YOUTUBE_REDIRECT_URI;

// Constants for OAuth state
const STATE_KEY = 'youtube_oauth_state'; // Match the key used in YouTubeConnect
const STATE_TIMESTAMP_KEY = 'youtube_oauth_timestamp';
const SIGNUP_DATA_KEY = 'signUpData';
const SIGNUP_FLOW_KEY = 'isSignUpFlow';
const STATE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

// Storage helper functions
const storeState = (state: string) => {
  const timestamp = Date.now();
  console.log('Storing state:', { state, timestamp });
  
  try {
    // Clear any existing state first
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(STATE_TIMESTAMP_KEY);
    
    // Store new state
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(STATE_TIMESTAMP_KEY, timestamp.toString());
    
    // Verify storage
    const storedState = sessionStorage.getItem(STATE_KEY);
    const storedTimestamp = sessionStorage.getItem(STATE_TIMESTAMP_KEY);
    console.log('Verifying stored state:', { 
      storedState, 
      storedTimestamp,
      stateMatches: storedState === state,
      timestampMatches: storedTimestamp === timestamp.toString()
    });
    
    if (!storedState || storedState !== state || !storedTimestamp) {
      throw new Error('State storage verification failed');
    }
  } catch (e) {
    console.error('Failed to store state:', e);
    // Clean up any partial state
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(STATE_TIMESTAMP_KEY);
    throw e;
  }
};

const getState = () => {
  try {
    const state = sessionStorage.getItem(STATE_KEY);
    const timestampStr = sessionStorage.getItem(STATE_TIMESTAMP_KEY);
    const timestamp = timestampStr ? parseInt(timestampStr, 10) : 0;

    console.log('Retrieved state:', { state, timestamp, now: Date.now() });
    
    // Validate timestamp
    if (timestamp && Date.now() - timestamp > STATE_EXPIRATION_MS) {
      console.log('State expired, clearing...');
      clearState();
      return { state: null, timestamp: 0 };
    }

    return { state, timestamp };
  } catch (e) {
    console.error('Failed to get state:', e);
    clearState();
    return { state: null, timestamp: 0 };
  }
};

const clearState = () => {
  console.log('Clearing OAuth state');
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(STATE_TIMESTAMP_KEY);
};

interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface UseGoogleAuthProps {
  onSuccess: (response: GoogleAuthResponse) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    console.error('Google Auth Error:', errorObj);
    onError?.(errorObj);
    setIsAuthenticating(false);
  }, [onError]);

  const initiateAuth = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      handleError('Google Client ID is not configured');
      return;
    }

    try {
      console.log('Initiating OAuth flow...');
      setIsAuthenticating(true);

      // Define required scopes for YouTube access
      const scopes = [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly'
      ].join(' ');

      // Debug scope before encoding
      console.log('Raw scopes:', scopes);
      
      // Generate a simpler state string
      const state = Math.random().toString(36).substring(2, 15);
      console.log('Generated OAuth state:', state);

      // Clear any existing state and store new state
      clearState();
      storeState(state);

      // Double check state was stored correctly
      const { state: verifyState } = getState();
      console.log('Verifying stored state before redirect:', {
        generatedState: state,
        storedState: verifyState,
        matches: verifyState === state
      });

      if (!verifyState || verifyState !== state) {
        throw new Error('State verification failed before redirect');
      }

      // Construct auth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', YOUTUBE_REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scopes); // URLSearchParams will handle encoding
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      console.log('Redirecting to auth URL:', authUrl.toString());

      // Redirect to Google OAuth
      window.location.href = authUrl.toString();

    } catch (error) {
      handleError(error instanceof Error ? error : 'Failed to initialize authentication');
    }
  }, [handleError]);

  const handleCallback = useCallback(async (params: URLSearchParams) => {
    console.log('Handling callback with params:', Object.fromEntries(params));

    try {
      const code = params.get('code');
      const incomingState = params.get('state');
      const error = params.get('error');

      if (error) {
        throw new Error(`Google OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('Missing authorization code');
      }

      if (!incomingState) {
        throw new Error('Missing OAuth state parameter');
      }

      // Get stored state and validate
      const { state: storedState } = getState();
      
      console.log('Validating OAuth state:', {
        incomingState,
        storedState,
        matches: storedState === incomingState
      });

      if (!storedState) {
        throw new Error('No OAuth state found in session');
      }

      if (storedState !== incomingState) {
        throw new Error(`OAuth state mismatch. Expected: ${storedState}, Got: ${incomingState}`);
      }

      // Exchange code for tokens
      console.log('Exchanging code for tokens...');
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: YOUTUBE_REDIRECT_URI,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => null);
        console.error('Token exchange error:', errorData);
        throw new Error(
          `Failed to exchange code for tokens: ${tokenResponse.status} ${tokenResponse.statusText}` +
          (errorData ? ` - ${JSON.stringify(errorData)}` : '')
        );
      }

      const data: GoogleAuthResponse = await tokenResponse.json();
      console.log('Successfully exchanged code for tokens');

      // Only clear state after successful token exchange
      clearState();

      await onSuccess(data);
      setIsAuthenticating(false);
      return true;
    } catch (error) {
      handleError(error instanceof Error ? error : 'Failed to process authentication callback');
      return false;
    }
  }, [onSuccess, handleError]);

  return {
    initiateAuth,
    handleCallback,
    isAuthenticating
  };
}
