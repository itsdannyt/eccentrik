import { supabase } from './supabaseClient';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  youtubeData?: {
    channelId: string;
    channelTitle: string;
    channelUrl: string;
    accessToken: string;
    refreshToken?: string;
    statistics?: {
      viewCount: string;
      subscriberCount: string;
      videoCount: string;
    };
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp({ email, password, fullName, youtubeData }: SignUpData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          youtube_channel: youtubeData?.channelUrl,
          channel_id: youtubeData?.channelId,
          channel_title: youtubeData?.channelTitle,
          channel_stats: youtubeData?.statistics,
          youtube_token: youtubeData?.accessToken,
          youtube_refresh_token: youtubeData?.refreshToken
        },
      },
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // When email confirmation is required, data.user will exist but data.session will be null
    if (data?.user) {
      // Store YouTube tokens if available
      if (youtubeData?.accessToken) {
        const { error: tokenError } = await supabase
          .from('user_youtube_tokens')
          .upsert({
            user_id: data.user.id,
            access_token: youtubeData.accessToken,
            refresh_token: youtubeData.refreshToken,
            token_type: 'Bearer',
            expires_in: 3600, // Default to 1 hour
            scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube',
            created_at: new Date().toISOString(),
          });

        if (tokenError) {
          console.error('Failed to store YouTube tokens:', tokenError);
          throw tokenError;
        }
      }

      return {
        data,
        confirmEmail: !data.user.confirmed_at,
      };
    }

    throw new Error('Failed to create account - please try again');
  } catch (error) {
    console.error('Sign-up error:', error);
    throw error;
  }
}

export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}