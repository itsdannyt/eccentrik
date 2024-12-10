import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('Received tokens in callback');
          // Store the tokens
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }

        // Check if the user's email is confirmed
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email_confirmed_at) {
          console.log('Email confirmed, proceeding to dashboard');
          toast.success('Successfully signed in!');
          navigate('/dashboard');
        } else {
          console.log('Email not confirmed yet');
          toast.success('Please check your email to confirm your account.');
          navigate('/verify-email');
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing sign up...</h1>
        <p className="text-gray-600">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}
