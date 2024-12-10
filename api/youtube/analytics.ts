import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { youtube_v3, youtubeAnalytics_v2 } from 'googleapis';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.query;
  
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

    // Get channel details
    const channelResponse = await youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      mine: true
    });

    const channel = channelResponse.data.items?.[0];
    if (!channel) {
      throw new Error('Channel not found');
    }

    // Get analytics data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '2020-01-01';

    const analyticsResponse = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      metrics: 'estimatedMinutesWatched,views,likes,subscribersGained',
      startDate,
      endDate,
      dimensions: 'video',
      sort: '-estimatedMinutesWatched',
      maxResults: 10
    });

    return res.status(200).json({
      channel: {
        id: channel.id,
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        statistics: channel.statistics,
      },
      analytics: analyticsResponse.data || {}
    });
  } catch (error: any) {
    console.error('YouTube Analytics API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch YouTube analytics',
      details: error.message 
    });
  }
};

export default handler;
