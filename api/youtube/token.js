import { google } from 'googleapis';

export default async function handler(req, res) {
  console.log('Token endpoint called with method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;
    console.log('Received authorization code:', code);

    if (!code) {
      console.error('No authorization code provided');
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.VITE_YOUTUBE_CLIENT_SECRET,
      process.env.VITE_YOUTUBE_REDIRECT_URI
    );

    console.log('Attempting to exchange code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Token exchange successful');

    return res.status(200).json(tokens);
  } catch (error) {
    console.error('Error in token exchange:', error);
    return res.status(500).json({ error: error.message });
  }
}
