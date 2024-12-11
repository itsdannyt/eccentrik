import express from 'express';
import { Router } from 'express';
import { google } from 'googleapis';
import { createOAuth2Client, YOUTUBE_SCOPES } from '../../config/oauth.config';

const router = Router();

// Generate OAuth URL
router.get('/auth-url', (req, res) => {
  try {
    const oauth2Client = createOAuth2Client();
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: YOUTUBE_SCOPES,
      include_granted_scopes: true,
      prompt: 'consent'
    });

    console.log('Generated auth URL:', authUrl);
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate auth URL:', error);
    res.status(500).json({ 
      error: 'Configuration Error',
      message: 'Failed to generate authentication URL'
    });
  }
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  console.log('\n=== OAuth Callback ===');
  console.log('Received code:', code);

  if (!code || typeof code !== 'string') {
    console.error('No authorization code received');
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'No authorization code received'
    });
  }

  try {
    const oauth2Client = createOAuth2Client();
    console.log('Getting tokens...');
    
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Received tokens:', {
      access_token: tokens.access_token ? 'present' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing',
      expiry_date: tokens.expiry_date
    });

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Store tokens securely (implement your storage logic here)
    // For example, store in session or database
    
    res.json({
      success: true,
      message: 'Successfully authenticated with YouTube',
      accessToken: tokens.access_token
    });
  } catch (error: any) {
    console.error('Token exchange failed:', error);
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to exchange authorization code for tokens',
      details: error.message
    });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  const { accessToken } = req.body;
  console.log('\n=== Token Verification ===');
  
  if (!accessToken) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'No access token provided'
    });
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Verify token by making a test request
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    await youtube.channels.list({
      part: ['snippet'],
      mine: true
    });

    res.json({
      valid: true,
      message: 'Token is valid'
    });
  } catch (error: any) {
    console.error('Token verification failed:', error);
    res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token',
      details: error.message
    });
  }
});

// Handle token refresh
router.post('/refresh', async (req, res) => {
  const { accessToken } = req.body;
  console.log('\n=== Token Refresh ===');
  
  if (!accessToken) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'No access token provided'
    });
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      scope: YOUTUBE_SCOPES.join(' ')
    });
    
    console.log('Refreshing token...');
    const { tokens } = await oauth2Client.refreshAccessToken();
    console.log('Token refreshed successfully');

    res.json({
      success: true,
      accessToken: tokens.access_token
    });
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    res.status(401).json({
      error: 'Authentication Error',
      message: 'Failed to refresh access token',
      details: error.message
    });
  }
});

// Handle YouTube channel disconnection
router.post('/disconnect', async (req, res) => {
  console.log('\n=== YouTube Channel Disconnection ===');
  
  try {
    // Get user session
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No active session found'
      });
    }

    // Clear YouTube tokens from user's metadata
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({
        youtube_access_token: null,
        youtube_refresh_token: null,
        youtube_channel_id: null,
        youtube_channel_name: null
      })
      .eq('id', session.user.id);

    if (userError) {
      console.error('Failed to clear YouTube tokens:', userError);
      throw userError;
    }

    console.log('YouTube channel disconnected successfully');
    res.json({
      success: true,
      message: 'YouTube channel disconnected successfully'
    });
  } catch (error: any) {
    console.error('Disconnection failed:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to disconnect YouTube channel',
      details: error.message
    });
  }
});

export default router;
