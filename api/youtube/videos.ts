import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, id } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth });

    if (id) {
      // Get specific video(s) by ID
      const response = await youtube.videos.list({
        part: ['snippet,statistics,contentDetails'],
        id: Array.isArray(id) ? id.join(',') : id
      });
      return res.status(200).json(response.data);
    } else {
      // Get recent videos
      const response = await youtube.search.list({
        part: ['id,snippet'],
        forMine: true,
        maxResults: 3,
        order: 'date',
        type: 'video'
      });
      return res.status(200).json(response.data);
    }
  } catch (error: any) {
    console.error('YouTube Videos API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube videos',
      details: error.message 
    });
  }
}
