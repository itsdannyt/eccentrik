import React from 'react';
import { useAuth } from '../../lib/auth/AuthProvider';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export function YouTubeConnect() {
  const { user, youtubeToken, setYoutubeToken } = useAuth();

  const handleConnectYouTube = async () => {
    // Debug: Log environment variables
    console.log('Client ID:', import.meta.env.VITE_YOUTUBE_CLIENT_ID);
    console.log('Redirect URI:', import.meta.env.VITE_YOUTUBE_REDIRECT_URI);

    // Generate a random state value
    const state = Math.random().toString(36).substring(7);
    // Store state in sessionStorage for verification
    sessionStorage.setItem('youtube_oauth_state', state);

    // Generate OAuth URL with debug logging
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_YOUTUBE_REDIRECT_URI,
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
  };

  // Handle OAuth callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const storedState = sessionStorage.getItem('youtube_oauth_state');
    
    // Debug: Log callback parameters
    console.log('Callback params:', {
      code: code ? 'present' : 'missing',
      state,
      storedState,
      location: window.location.href
    });

    if (code && state && storedState === state) {
      // Clear state from storage
      sessionStorage.removeItem('youtube_oauth_state');

      // Exchange code for token
      fetch('/api/youtube/token', {
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
        });
    }
  }, [user]);

  if (youtubeToken) {
    return null; // Don't show button if already connected
  }

  return (
    <Button
      onClick={handleConnectYouTube}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      Connect YouTube Account
    </Button>
  );
}
