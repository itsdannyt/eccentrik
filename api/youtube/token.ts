import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirect_uri } = req.body;

  // Debug: Log request data
  console.log('Token exchange request:', {
    code: code ? 'present' : 'missing',
    redirect_uri,
    client_id: process.env.VITE_YOUTUBE_CLIENT_ID ? 'present' : 'missing',
    client_secret: process.env.YOUTUBE_CLIENT_SECRET ? 'present' : 'missing'
  });

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri
    );

    console.log('Attempting to exchange code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Token exchange response:', {
      access_token: tokens.access_token ? 'present' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing',
      expiry_date: tokens.expiry_date
    });
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    // Log the full error for debugging
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({ 
      error: 'Failed to exchange code for token',
      details: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
