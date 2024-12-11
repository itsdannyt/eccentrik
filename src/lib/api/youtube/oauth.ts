import { SupabaseClient } from '@supabase/supabase-js';

const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
];

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export class YouTubeOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    this.redirectUri = `${window.location.origin}/auth/callback`;
    this.supabase = supabaseClient;
  }

  public getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: OAUTH_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  public async handleCallback(code: string): Promise<void> {
    try {
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error('Token exchange failed:', error);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Store tokens in Supabase
      const { error: updateError } = await this.supabase
        .from('user_youtube_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type,
          expires_in: tokens.expires_in,
          scope: tokens.scope,
          created_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Failed to store tokens:', updateError);
        throw updateError;
      }

      // Update user metadata
      const { error: metadataError } = await this.supabase.auth.updateUser({
        data: {
          youtube_connected: true,
          youtube_connected_at: new Date().toISOString()
        }
      });

      if (metadataError) {
        console.error('Failed to update user metadata:', metadataError);
        throw metadataError;
      }

    } catch (error) {
      console.error('YouTube OAuth callback failed:', error);
      throw error;
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await response.json();
      
      // Update token in Supabase
      const { error } = await this.supabase
        .from('user_youtube_tokens')
        .update({
          access_token: tokens.access_token,
          expires_in: tokens.expires_in,
        })
        .match({ user_id: (await this.supabase.auth.getUser()).data.user?.id });

      if (error) {
        throw error;
      }

      return tokens.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }
}
