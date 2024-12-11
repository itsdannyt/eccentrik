import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { YouTubeOAuth } from '../../lib/api/youtube/oauth';
import { useSupabase } from '../../lib/hooks/useSupabase';

export function VerifyEmail() {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkEmailVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email_confirmed_at) {
        setIsVerified(true);
        
        // Get stored channel data
        const channelData = localStorage.getItem('pendingYouTubeChannel');
        if (channelData) {
          localStorage.removeItem('pendingYouTubeChannel');
          
          // Initialize YouTube OAuth with Supabase client
          const youtubeOAuth = new YouTubeOAuth(supabase);
          const authUrl = youtubeOAuth.getAuthUrl();
          
          // Redirect to YouTube OAuth
          window.location.href = authUrl;
        } else {
          navigate('/dashboard');
        }
      }
    };

    const interval = setInterval(checkEmailVerification, 2000);
    return () => clearInterval(interval);
  }, [navigate, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-4">
            We've sent you an email with a verification link.
            Please check your inbox and click the link to verify your account.
          </p>
          {isVerified ? (
            <div className="text-green-600">
              <p>Email verified! Connecting your YouTube account...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mt-4"></div>
            </div>
          ) : (
            <div className="text-gray-500">
              <p>Waiting for verification...</p>
              <div className="animate-pulse mt-4">⌛</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
