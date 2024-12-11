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

function calculateEngagementRate(stats: ChannelStats): string {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}

async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Log environment variables (without sensitive values)
    console.log('Environment check:', {
      hasClientId: !!process.env.VITE_YOUTUBE_CLIENT_ID,
      hasClientSecret: !!process.env.VITE_YOUTUBE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.VITE_YOUTUBE_REDIRECT_URI
    });

    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    console.log('Authorization header present');
    // Extract token, handling both "Bearer" prefix and raw token cases
    const accessToken = authorization.replace(/^Bearer\s+/i, '');
    
    console.log('Creating OAuth2 client...');
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_YOUTUBE_CLIENT_ID,
      process.env.VITE_YOUTUBE_CLIENT_SECRET,
      process.env.VITE_YOUTUBE_REDIRECT_URI
    );

    console.log('Setting credentials...');
    oauth2Client.setCredentials({
      access_token: accessToken,
      token_type: 'Bearer'
    });

    // Verify token validity
    try {
      console.log('Verifying token...');
      await oauth2Client.getTokenInfo(accessToken);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please reconnect your YouTube account.',
        details: tokenError instanceof Error ? tokenError.message : 'Unknown error'
      });
      return;
    }

    console.log('Initializing YouTube API clients...');
    const youtube = google.youtube('v3');
    const youtubeAnalytics = google.youtubeAnalytics('v2');

    console.log('Fetching channel ID...');
    try {
      const channelResponse = await youtube.channels.list({
        auth: oauth2Client,
        part: ['id', 'statistics'],
        mine: true
      });

      console.log('Channel response:', channelResponse.data);

      const channelId = channelResponse.data.items?.[0]?.id;
      if (!channelId) {
        throw new Error('Channel ID not found');
      }
      
      console.log('Found channel ID:', channelId);
      
      // Get basic channel statistics
      const stats = channelResponse.data.items?.[0]?.statistics as ChannelStats;
      console.log('Channel statistics:', stats);

      console.log('Fetching analytics data...');
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

      console.log('Analytics response:', analyticsResponse.data);

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

      console.log('Sending response:', response);
      res.status(200).json(response);
    } catch (apiError: any) {
      console.error('YouTube API Error:', apiError);
      
      // Check if it's an auth error
      if (apiError.response?.status === 401 || apiError.code === 401) {
        res.status(401).json({
          error: 'YouTube authentication failed',
          message: 'Please sign out and sign in again to refresh your YouTube access.',
          details: apiError.message
        });
        return;
      }
      
      throw apiError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Error in YouTube analytics endpoint:', error);
    
    // Send more detailed error information
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
  }
}

export { handler as default };
