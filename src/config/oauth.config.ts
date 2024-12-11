import { google } from 'googleapis';
import { youtubeConfig } from './youtube.config';

// Define required YouTube scopes
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
];

// Create a single OAuth2 client instance
export const createOAuth2Client = () => {
  console.log('\n=== Creating OAuth2 Client ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Config values:', {
    hasClientId: !!youtubeConfig.clientId,
    clientIdLength: youtubeConfig.clientId?.length,
    hasClientSecret: !!youtubeConfig.clientSecret,
    secretLength: youtubeConfig.clientSecret?.length,
    redirectUri: youtubeConfig.redirectUri,
    scopes: YOUTUBE_SCOPES
  });

  // Check for required values
  if (!youtubeConfig.clientId || !youtubeConfig.clientSecret || !youtubeConfig.redirectUri) {
    console.error('Missing OAuth2 configuration:', {
      clientId: youtubeConfig.clientId ? 'present' : 'missing',
      clientSecret: youtubeConfig.clientSecret ? 'present' : 'missing',
      redirectUri: youtubeConfig.redirectUri ? 'present' : 'missing'
    });
    throw new Error('Missing required OAuth2 configuration');
  }

  const oauth2Client = new google.auth.OAuth2(
    youtubeConfig.clientId,
    youtubeConfig.clientSecret,
    youtubeConfig.redirectUri
  );

  console.log('OAuth2 client created successfully');
  console.log('=========================\n');

  return oauth2Client;
};

// Create YouTube API clients
export const createYouTubeClients = (oauth2Client: any) => {
  console.log('\n=== Creating YouTube Clients ===');
  
  // Verify oauth2Client has credentials
  if (!oauth2Client.credentials?.access_token) {
    throw new Error('OAuth2 client is missing access token');
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  const youtubeAnalytics = google.youtubeAnalytics({
    version: 'v2',
    auth: oauth2Client
  });

  console.log('YouTube clients created successfully');
  console.log('=========================\n');

  return { youtube, youtubeAnalytics };
};
