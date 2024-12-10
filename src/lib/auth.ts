import { supabase } from './supabaseClient';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  metadata?: {
    youtubeChannel?: string;
    channelId?: string;
    channelTitle?: string;
    channelStats?: {
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

export async function signUp({ email, password, fullName, metadata }: SignUpData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          youtube_channel: metadata?.youtubeChannel,
          channel_id: metadata?.channelId,
          channel_title: metadata?.channelTitle,
          channel_stats: metadata?.channelStats,
        },
      },
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // When email confirmation is required, data.user will exist but data.session will be null
    if (data?.user) {
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