import type { VercelRequest, VercelResponse } from '@vercel/node';

type YouTubeParams = {
  part?: string;
  id?: string;
  maxResults?: string;
  mine?: string;
  forUsername?: string;
  q?: string;
  type?: string;
  videoCategoryId?: string;
  order?: string;
  forMine?: string;
  accessToken?: string;
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...queryParams } = req.query;
  const params = queryParams as YouTubeParams;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  try {
    const { google } = await import('googleapis');
    const youtube = google.youtube('v3');
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    let auth;
    if (params.accessToken && typeof params.accessToken === 'string') {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: params.accessToken });
      auth = oauth2Client;
    } else {
      auth = YOUTUBE_API_KEY;
    }

    switch (endpoint) {
      case 'videos': {
        const response = await youtube.videos.list({
          auth,
          part: ['snippet', 'statistics', 'contentDetails'],
          id: params.id,
          maxResults: params.maxResults ? parseInt(params.maxResults) : undefined
        });
        return res.status(200).json(response?.data || {});
      }

      case 'channels': {
        const response = await youtube.channels.list({
          auth,
          part: ['snippet', 'statistics', 'contentDetails'],
          id: params.id,
          mine: params.mine === 'true',
          forUsername: params.forUsername
        });
        return res.status(200).json(response?.data || {});
      }

      case 'search': {
        const response = await youtube.search.list({
          auth,
          part: ['snippet'],
          q: params.q,
          type: params.type ? [params.type] : undefined,
          videoCategoryId: params.videoCategoryId,
          order: params.order,
          maxResults: params.maxResults ? parseInt(params.maxResults) : undefined,
          forMine: params.forMine === 'true'
        });
        return res.status(200).json(response?.data || {});
      }

      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }
  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube data',
      details: error.message 
    });
  }
};

export default handler;
