import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: 'No authorization token provided' });
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
    const stats = channelResponse.data.items?.[0]?.statistics;

    // Get analytics data
    const analyticsResponse = await youtubeAnalytics.reports.query({
      auth: oauth2Client,
      dimensions: 'video',
      metrics: 'estimatedMinutesWatched,views,likes,comments',
      ids: `channel==${channelId}`,
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      sort: '-estimatedMinutesWatched'
    });

    return res.status(200).json({
      overview: {
        totalViews: stats?.viewCount || '0',
        subscribers: stats?.subscriberCount || '0',
        totalVideos: stats?.videoCount || '0',
        watchTime: (analyticsResponse.data?.rows?.[0]?.[1] || 0).toString(),
        engagementRate: calculateEngagementRate(stats)
      },
      analyticsData: analyticsResponse.data
    });
  } catch (error) {
    console.error('Error fetching YouTube analytics:', error);
    return res.status(500).json({ error: error.message });
  }
}

function calculateEngagementRate(stats) {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}
