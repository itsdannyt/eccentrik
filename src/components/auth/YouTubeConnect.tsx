import React from 'react';
import { useAuth } from '../../lib/auth/AuthProvider';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export function YouTubeConnect() {
  const { user, youtubeToken, setYoutubeToken } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleConnectYouTube = async () => {
    try {
      const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_YOUTUBE_REDIRECT_URI;

      // Validate required environment variables
      if (!clientId) {
        throw new Error('YouTube Client ID is not configured');
      }
      if (!redirectUri) {
        throw new Error('YouTube Redirect URI is not configured');
      }

      // Debug: Log environment variables
      console.log('Environment Variables:', {
        clientId,
        redirectUri,
        nodeEnv: import.meta.env.MODE,
        baseUrl: window.location.origin
      });

      // Generate a random state value
      const state = Math.random().toString(36).substring(7);
      // Store state in sessionStorage for verification
      sessionStorage.setItem('youtube_oauth_state', state);

      // Generate OAuth URL with debug logging
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
        access_type: 'offline',
        state: state,
        prompt: 'consent'
      });

      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      console.log('OAuth URL:', oauthUrl);

      // Open OAuth window
      window.location.href = oauthUrl;
    } catch (err) {
      console.error('Error initiating OAuth:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate YouTube connection');
    }
  };

  // Handle OAuth callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const storedState = sessionStorage.getItem('youtube_oauth_state');
    
    // Debug: Log callback parameters
    console.log('Callback params:', {
      code: code ? 'present' : 'missing',
      state,
      error,
      storedState,
      location: window.location.href
    });

    if (error) {
      console.error('OAuth error:', error);
      setError(`Authentication failed: ${error}`);
      return;
    }

    if (code && state && storedState === state) {
      // Clear state from storage
      sessionStorage.removeItem('youtube_oauth_state');

      // Exchange code for token
      fetch('/api/youtube/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          redirect_uri: import.meta.env.VITE_YOUTUBE_REDIRECT_URI 
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Token response:', data);
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.access_token && user) {
            // Store token in user metadata
            supabase.auth.updateUser({
              data: { youtube_token: data.access_token }
            }).then(() => {
              setYoutubeToken(data.access_token);
              // Redirect to dashboard after successful connection
              window.location.href = '/dashboard';
            });
          }
        })
        .catch(error => {
          console.error('Error exchanging code for token:', error);
          setError('Failed to complete YouTube connection');
        });
    }
  }, [user]);

  if (youtubeToken) {
    return null; // Don't show button if already connected
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}
      <Button
        onClick={handleConnectYouTube}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Connect YouTube Account
      </Button>
    </div>
  );
}
