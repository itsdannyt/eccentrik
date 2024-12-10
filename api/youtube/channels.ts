import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { youtube_v3 } from 'googleapis';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, id, publishedBefore } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: typeof id === 'string' ? id : undefined,
      publishedBefore: typeof publishedBefore === 'string' ? publishedBefore : undefined
    });

    return res.status(200).json(response.data || {});
  } catch (error: any) {
    console.error('YouTube Channels API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube channel data',
      details: error.message 
    });
  }
};

export default handler;
