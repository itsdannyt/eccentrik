import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getChannelAnalytics, getRecentVideosWithAnalytics } from './youtube-service';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const { endpoint } = request.query;
    const accessToken = request.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return response.status(401).json({ error: 'No access token provided' });
    }

    if (!endpoint || typeof endpoint !== 'string') {
      return response.status(400).json({ error: 'Endpoint is required' });
    }

    let data;
    switch (endpoint) {
      case 'channel-analytics':
        data = await getChannelAnalytics(accessToken);
        break;
      case 'recent-videos':
        data = await getRecentVideosWithAnalytics(accessToken);
        break;
      default:
        return response.status(400).json({ error: 'Invalid endpoint' });
    }

    return response.status(200).json(data);
  } catch (error: any) {
    console.error('YouTube API error:', error);
    return response.status(error.status || 500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
