import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { youtube_v3 } from 'googleapis';

const youtube = google.youtube('v3');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...queryParams } = req.query;
  const params = queryParams as YouTubeParams;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  try {
    let auth;
    if (params.accessToken && typeof params.accessToken === 'string') {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: params.accessToken });
      auth = oauth2Client;
    } else {
      auth = YOUTUBE_API_KEY;
    }

    let response: youtube_v3.Schema$VideoListResponse | youtube_v3.Schema$ChannelListResponse | youtube_v3.Schema$SearchListResponse;

    const commonParams = {
      auth,
      part: params.part?.split(',') as string[]
    };

    switch (endpoint) {
      case 'videos':
        const videoResponse = await youtube.videos.list({
          ...commonParams,
          id: params.id,
          maxResults: params.maxResults
        });
        response = videoResponse.data;
        break;

      case 'channels':
        const channelResponse = await youtube.channels.list({
          ...commonParams,
          id: params.id,
          mine: params.mine,
          forUsername: params.forUsername
        });
        response = channelResponse.data;
        break;

      case 'search':
        const searchResponse = await youtube.search.list({
          ...commonParams,
          q: params.q,
          type: params.type?.split(',') as string[],
          videoCategoryId: params.videoCategoryId,
          order: params.order as string,
          maxResults: params.maxResults,
          forMine: params.forMine
        });
        response = searchResponse.data;
        break;

      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    return res.status(200).json(response || {});
  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube data',
      details: error.message 
    });
  }
}
