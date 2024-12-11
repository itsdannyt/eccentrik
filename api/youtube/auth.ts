import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { code, redirect_uri } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.VITE_YOUTUBE_CLIENT_SECRET,
      redirect_uri || process.env.VITE_YOUTUBE_REDIRECT_URI
    );

    console.log('Getting token with code:', code.substring(0, 10) + '...');
    
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Received tokens:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    res.status(200).json({
      access_token: tokens.access_token,
      token_type: tokens.token_type || 'Bearer',
      expiry_date: tokens.expiry_date,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ 
      error: 'Failed to exchange authorization code for token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
