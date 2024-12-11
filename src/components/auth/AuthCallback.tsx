import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a YouTube OAuth callback
        if (location.hash.includes('access_token')) {
          const params = new URLSearchParams(location.hash.substring(1));
          const accessToken = params.get('access_token');
          const state = params.get('state');
          
          // Verify state parameter
          const storedState = sessionStorage.getItem('oauth_state');
          if (!storedState || storedState !== state) {
            throw new Error('Invalid state parameter');
          }

          // Store YouTube credentials in session storage temporarily
          sessionStorage.setItem('youtube_credentials', JSON.stringify({
            accessToken,
            timestamp: Date.now()
          }));

          // Clear OAuth state
          sessionStorage.removeItem('oauth_state');

          // Return to signup page
          navigate('/signup');
          return;
        }

        // Handle Supabase auth callback
        console.log('Starting Supabase auth callback handling...');
        
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('Session data:', sessionData?.session?.user?.id);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User data:', user?.id);

        if (userError) {
          console.error('User error:', userError);
          toast.error('Failed to get user information.');
          navigate('/login');
          return;
        }

        if (!user) {
          console.error('No user found');
          toast.error('No user found. Please try signing up again.');
          navigate('/signup');
          return;
        }

        // Check if email is confirmed
        if (!user.email_confirmed_at) {
          console.log('Email not confirmed yet');
          toast.success('Please check your email to confirm your account.');
          navigate('/auth/verify-email');
          return;
        }

        // Get YouTube credentials from user metadata
        const youtubeToken = user.user_metadata?.youtube_access_token;
        
        if (!youtubeToken) {
          console.log('No YouTube credentials found');
          navigate('/dashboard');
          return;
        }

        // Verify YouTube credentials are still valid
        try {
          const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
            headers: {
              'Authorization': `Bearer ${youtubeToken}`
            }
          });

          if (!response.ok) {
            throw new Error('YouTube token validation failed');
          }
        } catch (error) {
          console.error('YouTube validation error:', error);
          // Token might be expired, but we'll let the user continue to dashboard
          // They can reconnect their channel there if needed
        }

        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
