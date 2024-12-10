import React from 'react';
import { useAuth } from '../../lib/auth/AuthProvider';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export function YouTubeConnect() {
  const { user, youtubeToken, setYoutubeToken } = useAuth();

  const handleConnectYouTube = async () => {
    // Generate OAuth URL
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${import.meta.env.VITE_YOUTUBE_REDIRECT_URI}&` +
      `response_type=token&` +
      `scope=https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open OAuth window
    window.location.href = oauthUrl;
  };

  // Handle OAuth callback
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token && user) {
        // Store token in user metadata
        supabase.auth.updateUser({
          data: { youtube_token: token }
        }).then(() => {
          setYoutubeToken(token);
        });
      }
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
