import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { youtube_v3, youtubeAnalytics_v2 } from 'googleapis';
import { GaxiosPromise } from 'googleapis-common';

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

interface ChannelStats {
  viewCount?: string;
  subscriberCount?: string;
  videoCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface VideoStats {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface VideoInsights {
  type: 'improvement' | 'success';
  message: string;
}

interface VideoAnalytics {
  watchTime: string;
  avgViewDuration: string;
  engagementRate: string;
}

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  stats: VideoStats;
  analytics: VideoAnalytics;
  insights: VideoInsights[];
}

type QueryResponse = youtubeAnalytics_v2.Schema$QueryResponse;

export async function getChannelAnalytics(accessToken: string) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

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
    const analyticsResponse = await youtubeAnalytics.reports.query.call(youtubeAnalytics.reports, {
      auth: oauth2Client,
      dimensions: 'video',
      metrics: 'estimatedMinutesWatched,views,likes,comments',
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
        watchTime: (analyticsResponse.data.rows?.[0]?.[1] || 0).toString(),
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

    const videoIds = videosResponse.data.items
      ?.map(item => item.id?.videoId)
      .filter((id): id is string => !!id) || [];

    if (videoIds.length === 0) {
      return [];
    }

    // Get detailed video statistics
    const statsResponse = await youtube.videos.list({
      auth: oauth2Client,
      part: ['statistics', 'contentDetails'],
      id: videoIds
    });

    // Get analytics for these videos
    const analyticsResponse = await youtubeAnalytics.reports.query.call(youtubeAnalytics.reports, {
      auth: oauth2Client,
      dimensions: 'video',
      metrics: 'estimatedMinutesWatched,averageViewDuration,views,likes,comments',
      ids: 'channel==MINE',
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      filters: `video==${videoIds.join(',')}`
    });

    // Combine all data and generate AI insights
    return videosResponse.data.items?.map((video, index) => {
      const stats = statsResponse.data.items?.[index]?.statistics as VideoStats;
      const analyticsRow = analyticsResponse.data.rows?.find(
        row => row[0] === video.id?.videoId
      );
      
      return {
        id: video.id?.videoId,
        title: video.snippet?.title,
        thumbnail: video.snippet?.thumbnails?.high?.url,
        publishedAt: video.snippet?.publishedAt,
        stats,
        analytics: {
          watchTime: (analyticsRow?.[1] || 0).toString(),
          avgViewDuration: (analyticsRow?.[2] || 0).toString(),
          engagementRate: calculateVideoEngagementRate(stats)
        },
        insights: generateVideoInsights({
          title: video.snippet?.title || '',
          stats,
          analytics: analyticsRow?.map(val => val.toString()) || []
        })
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    throw error;
  }
}

function calculateEngagementRate(stats: ChannelStats): string {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}

function calculateVideoEngagementRate(stats: VideoStats): string {
  if (!stats?.viewCount) return '0';
  const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
  const views = parseInt(stats.viewCount);
  return ((interactions / views) * 100).toFixed(2);
}

function generateVideoInsights(data: { title: string; stats: VideoStats; analytics: string[] }): VideoInsights[] {
  const insights: VideoInsights[] = [];
  
  // View performance
  const viewCount = parseInt(data.stats?.viewCount || '0');
  
  if (viewCount < 100) {
    insights.push({
      type: 'improvement',
      message: 'This video has low views. Consider improving your thumbnail and title for better visibility.'
    });
  } else if (viewCount > 1000) {
    insights.push({
      type: 'success',
      message: 'Great job! This video is performing well in terms of views.'
    });
  }

  // Engagement analysis
  const likeCount = parseInt(data.stats?.likeCount || '0');
  const commentCount = parseInt(data.stats?.commentCount || '0');
  const engagementRate = ((likeCount + commentCount) / viewCount) * 100;

  if (engagementRate < 5) {
    insights.push({
      type: 'improvement',
      message: 'The engagement rate is low. Try asking questions in your video to encourage comments.'
    });
  } else if (engagementRate > 10) {
    insights.push({
      type: 'success',
      message: 'Excellent engagement rate! Your content is resonating with viewers.'
    });
  }

  return insights;
}
