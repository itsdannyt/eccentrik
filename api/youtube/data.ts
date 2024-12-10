import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const youtube = google.youtube('v3');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...params } = req.query;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  try {
    let response;
    const auth = params.accessToken ? 
      new google.auth.OAuth2().setCredentials({ access_token: params.accessToken }) : 
      YOUTUBE_API_KEY;

    switch (endpoint) {
      case 'videos':
        response = await youtube.videos.list({
          auth,
          part: params.part ? String(params.part).split(',') : ['snippet'],
          id: params.id as string,
          maxResults: params.maxResults ? Number(params.maxResults) : undefined
        });
        break;

      case 'channels':
        response = await youtube.channels.list({
          auth,
          part: params.part ? String(params.part).split(',') : ['snippet'],
          id: params.id as string,
          mine: params.mine === 'true',
          forUsername: params.forUsername as string
        });
        break;

      case 'search':
        response = await youtube.search.list({
          auth,
          part: params.part ? String(params.part).split(',') : ['snippet'],
          q: params.q as string,
          type: params.type ? String(params.type).split(',') : undefined,
          videoCategoryId: params.videoCategoryId as string,
          order: params.order as string,
          maxResults: params.maxResults ? Number(params.maxResults) : undefined,
          forMine: params.forMine === 'true'
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube data',
      details: error.message 
    });
  }
}
