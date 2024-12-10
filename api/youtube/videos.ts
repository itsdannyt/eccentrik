import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { youtube_v3 } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, id } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    let response: youtube_v3.Schema$VideoListResponse | youtube_v3.Schema$SearchListResponse;

    if (id) {
      // Get specific video(s) by ID
      const videoResponse = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: Array.isArray(id) ? id.join(',') : id
      });
      response = videoResponse.data;
    } else {
      // Get recent videos
      const searchResponse = await youtube.search.list({
        part: ['id', 'snippet'],
        forMine: true,
        maxResults: 3,
        order: 'date',
        type: ['video']
      });
      response = searchResponse.data;
    }

    return res.status(200).json(response || {});
  } catch (error: any) {
    console.error('YouTube Videos API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube videos',
      details: error.message 
    });
  }
}
