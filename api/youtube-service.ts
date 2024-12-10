import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.VITE_YOUTUBE_REDIRECT_URI
);

const youtube = google.youtube('v3');
const youtubeAnalytics = google.youtubeAnalytics('v2');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly'
];

export async function getChannelAnalytics(accessToken: string) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    // Get channel ID first
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ['id', 'statistics'],
      mine: true
    });

    const channelId = channelResponse.data.items?.[0].id;
    
    // Get basic channel statistics
    const stats = channelResponse.data.items?.[0].statistics;

    // Get analytics data
    const analyticsResponse = await youtubeAnalytics.reports.query({
      auth: oauth2Client,
      dimensions: ['video'],
      metrics: ['estimatedMinutesWatched', 'views', 'likes', 'comments'],
      ids: `channel==${channelId}`,
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      sort: '-estimatedMinutesWatched'
    });

    return {
      overview: {
        totalViews: stats?.viewCount || '0',
        subscribers: stats?.subscriberCount || '0',
        totalVideos: stats?.videoCount || '0',
        watchTime: analyticsResponse.data.rows?.[0]?.[1] || '0',
        engagementRate: calculateEngagementRate(stats)
      },
      analyticsData: analyticsResponse.data
    };
  } catch (error) {
    console.error('Error fetching channel analytics:', error);
    throw error;
  }
}

export async function getRecentVideosWithAnalytics(accessToken: string) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    // Get recent videos
    const videosResponse = await youtube.search.list({
      auth: oauth2Client,
      part: ['id', 'snippet'],
      forMine: true,
      maxResults: 3,
      order: 'date',
      type: ['video']
    });

    const videoIds = videosResponse.data.items?.map(item => item.id?.videoId) || [];

    // Get detailed video statistics
    const statsResponse = await youtube.videos.list({
      auth: oauth2Client,
      part: ['statistics', 'contentDetails'],
      id: videoIds
    });

    // Get analytics for these videos
    const analyticsResponse = await youtubeAnalytics.reports.query({
      auth: oauth2Client,
      dimensions: ['video'],
      metrics: ['estimatedMinutesWatched', 'averageViewDuration', 'views', 'likes', 'comments'],
      ids: 'channel==MINE',
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      filters: `video==${videoIds.join(',')}`
    });

    // Combine all data and generate AI insights
    const videos = videosResponse.data.items?.map((video, index) => {
      const stats = statsResponse.data.items?.[index].statistics;
      const analytics = analyticsResponse.data.rows?.find(row => row[0] === video.id?.videoId);
      
      return {
        id: video.id?.videoId,
        title: video.snippet?.title,
        thumbnail: video.snippet?.thumbnails?.high?.url,
        publishedAt: video.snippet?.publishedAt,
        stats: {
          views: stats?.viewCount || '0',
          likes: stats?.likeCount || '0',
          comments: stats?.commentCount || '0'
        },
        analytics: {
          watchTime: analytics?.[1] || '0',
          avgViewDuration: analytics?.[2] || '0',
          engagementRate: calculateVideoEngagementRate(stats)
        },
        insights: generateVideoInsights({
          title: video.snippet?.title || '',
          stats,
          analytics: analyticsResponse.data.rows?.[index]
        })
      };
    });

    return videos || [];
  } catch (error) {
    console.error('Error fetching recent videos:', error);
    throw error;
  }
}

function calculateEngagementRate(stats: any) {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}

function calculateVideoEngagementRate(stats: any) {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}

function generateVideoInsights(data: any) {
  const insights = [];
  
  // View performance
  const viewCount = parseInt(data.stats?.viewCount || '0');
  if (viewCount < 1000) {
    insights.push({
      type: 'improvement',
      message: 'Consider optimizing your title and thumbnails to improve visibility'
    });
  }

  // Engagement analysis
  const engagementRate = parseFloat(calculateVideoEngagementRate(data.stats));
  if (engagementRate < 5) {
    insights.push({
      type: 'improvement',
      message: 'Try adding calls-to-action in your videos to boost engagement'
    });
  } else if (engagementRate > 10) {
    insights.push({
      type: 'success',
      message: 'Great engagement! Your content is resonating with viewers'
    });
  }

  // Title analysis
  if (data.title.length < 30) {
    insights.push({
      type: 'improvement',
      message: 'Consider using longer, more descriptive titles (40-60 characters)'
    });
  }

  return insights;
}
