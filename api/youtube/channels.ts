import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, id, publishedBefore } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth });

    const response = await youtube.channels.list({
      part: ['snippet,statistics,contentDetails'],
      id: id as string,
      ...(publishedBefore && { publishedBefore: publishedBefore as string })
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('YouTube Channels API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube channel data',
      details: error.message 
    });
  }
}
