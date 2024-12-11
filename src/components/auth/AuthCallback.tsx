import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleAuth } from '../../lib/hooks/useGoogleAuth';
import { useSupabase } from '../../lib/hooks/useSupabase';
import { useAuth } from '../../lib/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { SignUpData } from '../../lib/auth';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  channelData?: {
    url: string;
    id: string;
    title: string;
    statistics: any;
  };
}

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useSupabase();
  const { session, refreshUser } = useAuth();

  const handleSignUp = async (signUpData: SignUpData, youtubeTokens: any) => {
    try {
      if (!signUpData || !youtubeTokens) {
        throw new Error('No active session or signup data found');
      }

      // Get channel info
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
        {
          headers: {
            Authorization: `Bearer ${youtubeTokens.access_token}`,
          },
        }
      );

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch YouTube channel data');
      }

      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];
      
      if (!channel) {
        throw new Error('No YouTube channel found');
      }

      // Create the user account with basic data first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            youtube_channel: `https://youtube.com/channel/${channel.id}`,
            channel_id: channel.id,
            channel_title: channel.snippet.title
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Store YouTube tokens in separate table
      const { error: tokenError } = await supabase
        .from('user_youtube_tokens')
        .insert({
          user_id: authData.user.id,
          access_token: youtubeTokens.access_token,
          refresh_token: youtubeTokens.refresh_token,
          token_type: youtubeTokens.token_type,
          expires_in: youtubeTokens.expires_in,
          scope: youtubeTokens.scope
        });

      if (tokenError) {
        console.error('Error storing YouTube tokens:', tokenError);
        // Consider cleanup if needed
        throw new Error('Failed to store YouTube tokens');
      }

      // Clear signup data
      sessionStorage.removeItem('signUpData');
      sessionStorage.removeItem('isSignUpFlow');

      // Show success message
      toast.success(
        'Account created successfully! Please check your email to verify your account.',
        { duration: 8000 }
      );

      // Redirect based on email verification status
      if (authData.user.email_confirmed_at) {
        navigate('/dashboard');
      } else {
        navigate('/auth/verify-email');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete signup');
      navigate('/signup');
    }
  };

  const { handleCallback: handleGoogleCallback } = useGoogleAuth({
    onSuccess: async (response) => {
      console.log('Auth successful, processing...');
      
      try {
        // Check if this is part of the signup flow
        const isSignUpFlow = sessionStorage.getItem('isSignUpFlow');
        const signUpDataStr = sessionStorage.getItem('signUpData');

        if (isSignUpFlow && signUpDataStr) {
          // Handle signup flow
          const signUpData = JSON.parse(signUpDataStr);
          await handleSignUp(signUpData, response);
        } else if (session?.user) {
          // Handle normal YouTube connection flow
          console.log('Storing tokens for existing user:', session.user.id);

          const { error: updateError } = await supabase
            .from('user_youtube_tokens')
            .upsert({
              user_id: session.user.id,
              access_token: response.access_token,
              refresh_token: response.refresh_token,
              token_type: response.token_type,
              expires_in: response.expires_in,
              scope: response.scope,
              created_at: new Date().toISOString(),
            });

          if (updateError) throw updateError;

          // Update user metadata
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              youtube_token: response.access_token,
              youtube_refresh_token: response.refresh_token
            }
          });

          if (metadataError) throw metadataError;

          // Refresh user data to get updated YouTube connection status
          await refreshUser();

          toast.success('YouTube channel connected successfully!');
          navigate('/dashboard');
        } else {
          throw new Error('No active session or signup data found');
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to process authentication');
        navigate('/signup');
      }
    },
    onError: (error) => {
      console.error('Google auth error:', error);
      toast.error('Failed to authenticate with Google');
      navigate('/signup');
    }
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      toast.error('Authentication failed');
      navigate('/signup');
      return;
    }

    if (code) {
      handleGoogleCallback(searchParams);
    } else {
      toast.error('No authentication code received');
      navigate('/signup');
    }
  }, [location.search]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processing authentication...</h2>
        <p className="text-gray-600">Please wait while we complete your request.</p>
      </div>
    </div>
  );
}
