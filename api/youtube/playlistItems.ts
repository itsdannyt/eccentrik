import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, playlistId, maxResults, pageToken } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  if (!playlistId || typeof playlistId !== 'string') {
    return res.status(400).json({ error: 'Playlist ID is required' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth });

    const response = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults: maxResults ? Number(maxResults) : undefined,
      pageToken: pageToken as string | undefined
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('YouTube PlaylistItems API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube playlist items',
      details: error.message 
    });
  }
}
