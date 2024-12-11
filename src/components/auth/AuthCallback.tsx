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
        // Check if this is a YouTube OAuth callback with code
        if (location.search.includes('code=')) {
          const params = new URLSearchParams(location.search);
          const code = params.get('code');
          const state = params.get('state');
          
          // Verify state parameter
          const storedState = localStorage.getItem('oauth_state');
          const stateTimestamp = parseInt(localStorage.getItem('oauth_state_timestamp') || '0');
          
          // Clear stored state immediately
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_state_timestamp');

          // Verify state is valid and not expired (30 minutes max)
          const stateAge = Date.now() - stateTimestamp;
          if (!storedState || storedState !== state || stateAge > 30 * 60 * 1000) {
            console.error('State validation failed:', { 
              storedState, 
              receivedState: state,
              stateAge,
              isExpired: stateAge > 30 * 60 * 1000
            });
            throw new Error('Invalid or expired authentication state');
          }

          // Store authorization code in session storage temporarily
          sessionStorage.setItem('youtube_auth_code', code!);

          // Return to signup page
          navigate('/signup');
          return;
        }

        // Handle Supabase auth callback
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (!sessionData.session) {
          navigate('/login');
          return;
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing authentication...</h2>
        <p className="text-gray-400">Please wait while we complete the process.</p>
      </div>
    </div>
  );
}
