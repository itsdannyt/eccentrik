import React from 'react';
import { useAuth } from '../../lib/auth/AuthProvider';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export function YouTubeConnect() {
  const { user, youtubeToken, setYoutubeToken } = useAuth();

  const handleConnectYouTube = async () => {
    // Generate a random state value
    const state = Math.random().toString(36).substring(7);
    // Store state in sessionStorage for verification
    sessionStorage.setItem('youtube_oauth_state', state);

    // Generate OAuth URL
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${import.meta.env.VITE_YOUTUBE_CLIENT_ID}&` +
      `redirect_uri=${import.meta.env.VITE_YOUTUBE_REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly&` +
      `access_type=offline&` +
      `state=${state}&` +
      `prompt=consent`;

    // Open OAuth window
    window.location.href = oauthUrl;
  };

  // Handle OAuth callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const storedState = sessionStorage.getItem('youtube_oauth_state');

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
