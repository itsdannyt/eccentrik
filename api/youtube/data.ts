import type { VercelRequest, VercelResponse } from '@vercel/node';

type YouTubeParams = {
  part?: string;
  id?: string;
  maxResults?: number;
  mine?: boolean;
  forUsername?: string;
  q?: string;
  type?: string;
  videoCategoryId?: string;
  order?: string;
  forMine?: boolean;
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

    const parts = params.part?.split(',') || ['snippet'];

    switch (endpoint) {
      case 'videos': {
        const videoResponse = await youtube.videos.list({
          auth,
          part: parts,
          id: params.id,
          maxResults: params.maxResults ? Number(params.maxResults) : undefined
        });
        return res.status(200).json(videoResponse.data || {});
      }

      case 'channels': {
        const channelResponse = await youtube.channels.list({
          auth,
          part: parts,
          id: params.id,
          mine: params.mine === 'true',
          forUsername: params.forUsername
        });
        return res.status(200).json(channelResponse.data || {});
      }

      case 'search': {
        const searchResponse = await youtube.search.list({
          auth,
          part: parts,
          q: params.q,
          type: params.type?.split(','),
          videoCategoryId: params.videoCategoryId,
          order: params.order,
          maxResults: params.maxResults ? Number(params.maxResults) : undefined,
          forMine: params.forMine === 'true'
        });
        return res.status(200).json(searchResponse.data || {});
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
