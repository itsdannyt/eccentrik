export const youtubeConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5174/auth/callback',
  apiKey: process.env.YOUTUBE_API_KEY || ''
};
