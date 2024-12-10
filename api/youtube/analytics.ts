import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth });
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth });

    // Get channel details
    const channelResponse = await youtube.channels.list({
      part: ['snippet,statistics,contentDetails'],
      mine: true
    });

    const channel = channelResponse.data.items?.[0];
    if (!channel) {
      throw new Error('Channel not found');
    }

    // Get analytics data
    const analyticsResponse = await youtubeAnalytics.reports.query({
      dimensions: ['video'],
      metrics: ['estimatedMinutesWatched', 'views', 'likes', 'subscribersGained'],
      sort: ['-estimatedMinutesWatched'],
      ids: 'channel==MINE',
      startDate: '2020-01-01',
      maxResults: 10
    });

    return res.status(200).json({
      channel: {
        id: channel.id,
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        statistics: channel.statistics,
      },
      analytics: analyticsResponse.data
    });
  } catch (error: any) {
    console.error('YouTube Analytics API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube analytics',
      details: error.message 
    });
  }
}
