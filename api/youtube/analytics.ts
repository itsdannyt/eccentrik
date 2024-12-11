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
    last30Days: {
      views: string;
      watchTimeMinutes: string;
      averageViewDurationSeconds: string;
    };
  };
  analyticsData: youtubeAnalytics_v2.Schema$QueryResponse;
}

function calculateEngagementRate(stats: ChannelStats): string {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}

function getDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
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

    const accessToken = authorization.replace(/^Bearer\s+/i, '');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.VITE_YOUTUBE_CLIENT_SECRET,
      process.env.VITE_YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const youtube = google.youtube('v3');
    const youtubeAnalytics = google.youtubeAnalytics('v2');

    try {
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

      // Get date range for last 30 days
      const { startDate, endDate } = getDateRange();

      // Get analytics data for last 30 days
      const analyticsResponse = await youtubeAnalytics.reports.query({
        auth: oauth2Client,
        ids: `channel==${channelId}`,
        metrics: 'views,estimatedMinutesWatched,averageViewDuration',
        dimensions: 'day',
        startDate,
        endDate,
        sort: '-day'
      }) as GaxiosResponse<youtubeAnalytics_v2.Schema$QueryResponse>;

      // Calculate 30-day totals
      const last30DaysStats = analyticsResponse.data.rows?.reduce(
        (acc, row) => ({
          views: acc.views + (Number(row[1]) || 0),
          watchTimeMinutes: acc.watchTimeMinutes + (Number(row[2]) || 0),
          // Average view duration is in seconds
          totalDuration: acc.totalDuration + (Number(row[3]) || 0),
          days: acc.days + 1
        }),
        { views: 0, watchTimeMinutes: 0, totalDuration: 0, days: 0 }
      ) || { views: 0, watchTimeMinutes: 0, totalDuration: 0, days: 1 };

      const response: AnalyticsResponse = {
        overview: {
          totalViews: stats?.viewCount || '0',
          subscribers: stats?.subscriberCount || '0',
          totalVideos: stats?.videoCount || '0',
          watchTime: last30DaysStats.watchTimeMinutes.toString(),
          engagementRate: calculateEngagementRate(stats),
          last30Days: {
            views: last30DaysStats.views.toString(),
            watchTimeMinutes: last30DaysStats.watchTimeMinutes.toString(),
            averageViewDurationSeconds: (last30DaysStats.totalDuration / last30DaysStats.days).toFixed(1)
          }
        },
        analyticsData: analyticsResponse.data
      };

      res.status(200).json(response);
    } catch (apiError: any) {
      console.error('YouTube API Error:', apiError);
      
      if (apiError.response?.status === 401 || apiError.code === 401) {
        res.status(401).json({
          error: 'YouTube authentication failed',
          message: 'Please reconnect your YouTube account.',
          details: apiError.message
        });
        return;
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('Error in YouTube analytics endpoint:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
