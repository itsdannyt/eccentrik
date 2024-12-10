import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Debug: Log request data (excluding sensitive info)
    console.log('Token exchange request:', {
      hasCode: !!code,
      redirect_uri,
      hasClientId: !!process.env.VITE_YOUTUBE_CLIENT_ID,
      hasClientSecret: !!process.env.YOUTUBE_CLIENT_SECRET
    });

    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri
    );

    try {
      console.log('Attempting to exchange code for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      console.log('Token exchange successful:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date
      });

      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      return res.status(200).json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      });
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      return res.status(400).json({
        error: 'Failed to exchange authorization code',
        details: tokenError.message
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
