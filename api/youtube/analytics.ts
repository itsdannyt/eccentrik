import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { youtube_v3, youtubeAnalytics_v2 } from 'googleapis';
import { GaxiosResponse } from 'googleapis-common';

interface ChannelStats {
  viewCount?: string;
  subscriberCount?: string;
  videoCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface AnalyticsResponse {
  overview: {
    totalViews: string;
    subscribers: string;
    totalVideos: string;
    watchTime: string;
    engagementRate: string;
  };
  analyticsData: youtubeAnalytics_v2.Schema$QueryResponse;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const accessToken = authorization.replace('Bearer ', '');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.VITE_YOUTUBE_CLIENT_SECRET,
      process.env.VITE_YOUTUBE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube('v3');
    const youtubeAnalytics = google.youtubeAnalytics('v2');

    // Get channel ID first
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ['id', 'statistics'],
      mine: true
    });

    const channelId = channelResponse.data.items?.[0]?.id;
    if (!channelId) {
      throw new Error('Channel ID not found');
    }
    
    // Get basic channel statistics
    const stats = channelResponse.data.items?.[0]?.statistics as ChannelStats;

    // Get analytics data
    const analyticsResponse = await youtubeAnalytics.reports.query({
      auth: oauth2Client,
      dimensions: 'video',
      metrics: 'estimatedMinutesWatched,views,likes,comments',
      ids: `channel==${channelId}`,
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      sort: '-estimatedMinutesWatched'
    }) as GaxiosResponse<youtubeAnalytics_v2.Schema$QueryResponse>;

    const response: AnalyticsResponse = {
      overview: {
        totalViews: stats?.viewCount || '0',
        subscribers: stats?.subscriberCount || '0',
        totalVideos: stats?.videoCount || '0',
        watchTime: (analyticsResponse.data?.rows?.[0]?.[1] || 0).toString(),
        engagementRate: calculateEngagementRate(stats)
      },
      analyticsData: analyticsResponse.data
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching YouTube analytics:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

function calculateEngagementRate(stats: ChannelStats): string {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}
