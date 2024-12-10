import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { YouTubeOAuth } from '@/lib/api/youtube/oauth';
import { syncYouTubeData } from '@/lib/api/youtube/sync';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        console.error('No code found in URL');
        toast.error('Failed to connect YouTube account');
        navigate('/dashboard');
        return;
      }

      try {
        // Handle OAuth callback
        const youtubeOAuth = new YouTubeOAuth();
        await youtubeOAuth.handleCallback(code);

        // Start initial data sync
        toast.loading('Syncing your YouTube data...', { duration: 5000 });
        await syncYouTubeData();

        // Success!
        toast.success('YouTube account connected successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to connect YouTube account');
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Connecting your YouTube account...</h2>
        <p className="text-gray-600 mb-4">This may take a few moments while we sync your data.</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
