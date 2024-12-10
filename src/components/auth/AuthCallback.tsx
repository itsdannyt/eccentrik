import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        
        // First, get the current session
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

        // Get the stored YouTube channel data
        const storedChannelData = localStorage.getItem('pendingYouTubeChannel');
        console.log('Stored channel data:', storedChannelData);

        if (storedChannelData) {
          try {
            const channelData = JSON.parse(storedChannelData);
            console.log('Proceeding with YouTube OAuth for channel:', channelData.title);
            
            // Clear the stored data
            localStorage.removeItem('pendingYouTubeChannel');
            
            // Redirect to YouTube OAuth
            const youtubeOAuthUrl = `${window.location.origin}/youtube/oauth`;
            window.location.href = youtubeOAuthUrl;
          } catch (error) {
            console.error('Error parsing stored channel data:', error);
            toast.error('Error processing YouTube channel data.');
            navigate('/dashboard');
          }
        } else {
          console.log('No stored channel data, proceeding to dashboard');
          toast.success('Successfully signed in!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('Something went wrong. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Completing sign up...
          </h1>
          <p className="text-gray-400">
            Please wait while we verify your account.
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
