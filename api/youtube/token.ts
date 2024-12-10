import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.VITE_YOUTUBE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return res.status(500).json({ error: 'Failed to exchange code for token' });
  }
}
