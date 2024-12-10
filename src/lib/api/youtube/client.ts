import axios from 'axios';
import { VideoStats, HistoricalData } from './types';
import { CacheService } from '../../services/CacheService';
import { RateLimitService } from '../../services/RateLimitService';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://youtube.googleapis.com/youtube/v3';

export class YouTubeClient {
  private static instance: YouTubeClient | null = null;
  private cacheService: CacheService;
  private rateLimitService: RateLimitService;
  private accessToken: string | null = null;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.rateLimitService = RateLimitService.getInstance();
  }

  public static getInstance(): YouTubeClient {
    if (!YouTubeClient.instance) {
      YouTubeClient.instance = new YouTubeClient();
    }
    return YouTubeClient.instance;
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public async getChannelAnalytics() {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    const response = await axios.get('/api/youtube/analytics', {
      params: {
        accessToken: this.accessToken
      }
    });

    return response.data;
  }

  public async getRecentVideos() {
    try {
      // Get recent videos
      const videosResponse = await axios.get('/api/youtube/videos', {
        params: {
          accessToken: this.accessToken
        }
      });

      const videoIds = videosResponse.data.items
        ?.map(item => item.id?.videoId)
        .filter((id): id is string => !!id) || [];

      if (videoIds.length === 0) {
        return [];
      }

      // Get detailed video statistics
      const statsResponse = await axios.get('/api/youtube/videos', {
        params: {
          accessToken: this.accessToken,
          id: videoIds.join(',')
        }
      });

      // Get analytics for these videos using the YouTube Analytics API client
      const analyticsResponse = await axios.get('/api/youtube/analytics', {
        params: {
          accessToken: this.accessToken,
          videoIds: videoIds.join(',')
        }
      });

      // Combine all data
      return videosResponse.data.items?.map((video, index) => {
        const stats = statsResponse.data.items?.[index]?.statistics;
        const analyticsRow = analyticsResponse.data.rows?.find(
          row => row[0] === video.id?.videoId
        );
        
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
            watchTime: (analyticsRow?.[1] || 0).toString(),
            avgViewDuration: (analyticsRow?.[2] || 0).toString(),
            engagementRate: this.calculateVideoEngagementRate(stats || {})
          },
          insights: this.generateVideoInsights({
            title: video.snippet?.title || '',
            stats: stats || {},
            analytics: analyticsRow?.map(val => val.toString()) || []
          })
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      throw error;
    }
  }

  private calculateCTR(stats: any): number {
    const views = parseInt(stats.viewCount) || 0;
    const impressions = views * 1.5; // Estimated impression count
    return Math.round((views / impressions) * 100);
  }

  async getHistoricalData(channelId: string, userId: string): Promise<HistoricalData> {
    try {
      const cacheKey = `historical_data_${channelId}`;
      const cached = this.cacheService.get<HistoricalData>(cacheKey);
      if (cached) return cached;

      // Get channel data
      const channelData = await axios.get('/api/youtube/channels', {
        params: {
          accessToken: this.accessToken,
          id: channelId
        }
      });

      if (!channelData.data.items || channelData.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = channelData.data.items[0];
      const statistics = channel.statistics;
      const channelTitle = channel.snippet.title;
      const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

      // Get recent videos
      const videos = await this.getPlaylistItems(uploadsPlaylistId, userId);
      const videoIds = videos.map((v: any) => v.snippet.resourceId.videoId);

      // Get video statistics
      const stats = await this.getVideoStatsBatched(videoIds, userId);

      // Since we don't have analytics data yet, use basic stats
      const thirtyDayMetrics = {
        views: parseInt(statistics.viewCount),
        watchTime: 0, // We don't have this data yet
        subscribersGained: parseInt(statistics.subscriberCount),
        subscribersLost: 0, // We don't have this data yet
        likes: 0, // We don't have this data yet
        comments: parseInt(statistics.commentCount) || 0
      };

      const historicalData: HistoricalData = {
        channelTitle,
        statistics: {
          ...statistics,
          thirtyDayMetrics,
          engagementRate: ((parseInt(statistics.commentCount) || 0) / parseInt(statistics.viewCount) * 100).toFixed(1)
        },
        averageCTR: this.calculateAverageCTR(stats),
        topPerformingVideos: videos.slice(0, 5).map(v => ({
          id: v.snippet.resourceId.videoId,
          title: v.snippet.title,
          publishedAt: v.snippet.publishedAt
        })),
        videoStats: stats.reduce((acc, stat, index) => {
          acc[videoIds[index]] = stat;
          return acc;
        }, {})
      };

      this.cacheService.set(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getHistoricalStats(channelId: string, userId: string) {
    const cacheKey = `historical_stats_${channelId}`;
    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await axios.get('/api/youtube/channels', {
      params: {
        accessToken: this.accessToken,
        id: channelId,
        publishedBefore: thirtyDaysAgo.toISOString()
      }
    });

    const previousStats = response.data?.items?.[0]?.statistics || {
      subscriberCount: '0',
      viewCount: '0',
      videoCount: '0',
      estimatedMinutesWatched: '0'
    };

    // Get video stats from 30 days ago
    const videos = await this.getPlaylistItems(channelId, userId);
    const videoStats: Record<string, any> = {};

    for (const video of videos) {
      const stats = await this.getVideoStats(video.id, userId, thirtyDaysAgo.toISOString());
      videoStats[video.id] = stats;
    }

    const data = { previousStats, videoStats };
    this.cacheService.set(cacheKey, data, 60 * 60); // Cache for 1 hour
    return data;
  }

  async getVideoStats(videoId: string, userId: string, publishedBefore?: string) {
    const cacheKey = `video_stats_${videoId}_${publishedBefore || 'current'}`;
    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const response = await axios.get('/api/youtube/videos', {
      params: {
        accessToken: this.accessToken,
        id: videoId,
        publishedBefore
      }
    });

    const stats = response.data?.items?.[0]?.statistics || {
      viewCount: '0',
      likeCount: '0',
      commentCount: '0'
    };

    this.cacheService.set(cacheKey, stats, 60 * 5); // Cache for 5 minutes
    return stats;
  }

  private async getPlaylistItems(playlistId: string, userId: string): Promise<any[]> {
    const batchSize = this.rateLimitService.getBatchSize();
    let allItems: any[] = [];
    let pageToken: string | undefined;

    do {
      const response = await axios.get('/api/youtube/playlistItems', {
        params: {
          accessToken: this.accessToken,
          playlistId,
          maxResults: batchSize,
          pageToken
        }
      });

      allItems = allItems.concat(response.data.items);
      pageToken = response.data.nextPageToken;
    } while (pageToken && allItems.length < batchSize);

    return allItems;
  }

  private async getVideoStatsBatched(videoIds: string[], userId: string): Promise<VideoStats[]> {
    const batchSize = this.rateLimitService.getBatchSize();
    const batches = [];
    
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batchIds = videoIds.slice(i, i + batchSize);
      batches.push(batchIds);
    }

    const results = await Promise.all(
      batches.map(batch => 
        axios.get('/api/youtube/videos', {
          params: {
            accessToken: this.accessToken,
            id: batch.join(',')
          }
        })
      )
    );

    return results.flatMap(response => response.data.items);
  }

  private calculateVideoEngagementRate(stats: any): string {
    if (!stats?.viewCount) return '0';
    const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
    const views = parseInt(stats.viewCount);
    return ((interactions / views) * 100).toFixed(2);
  }

  private generateVideoInsights(data: { title: string; stats: any; analytics: string[] }): Array<{ type: 'improvement' | 'success'; message: string }> {
    const insights: Array<{ type: 'improvement' | 'success'; message: string }> = [];
    
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
        message: 'This video is performing well in terms of views!'
      });
    }

    // Engagement metrics
    const likeCount = parseInt(data.stats?.likeCount || '0');
    const commentCount = parseInt(data.stats?.commentCount || '0');
    const engagementRate = ((likeCount + commentCount) / viewCount) * 100;

    if (engagementRate < 5) {
      insights.push({
        type: 'improvement',
        message: 'Try to increase engagement by asking questions in your video or encouraging comments.'
      });
    } else if (engagementRate > 10) {
      insights.push({
        type: 'success',
        message: 'Great engagement! Your audience is actively interacting with this content.'
      });
    }

    return insights;
  }

  private extractTopVideos(videos: any[], stats: VideoStats[]): Array<{ title: string; ctr: number; engagement: number }> {
    return videos.map((video, index) => ({
      title: video.snippet.title,
      ctr: this.calculateCTR(stats[index]),
      engagement: Math.round((parseInt(stats[index].likeCount) + parseInt(stats[index].commentCount)) / parseInt(stats[index].viewCount) * 100)
    })).sort((a, b) => b.ctr - a.ctr).slice(0, 5);
  }

  private extractKeywords(videos: any[]): string[] {
    const keywords = new Set<string>();
    videos.forEach(video => {
      const title = video.snippet.title.toLowerCase();
      const words = title.split(' ')
        .filter((word: string) => word.length > 3)
        .map((word: string) => word.replace(/[^\w\s]/g, ''));
      words.forEach((word: string) => keywords.add(word));
    });
    return Array.from(keywords).slice(0, 10);
  }

  private calculateAverageCTR(stats: VideoStats[]): number {
    if (!stats.length) return 0;
    const total = stats.reduce((sum, stat) => sum + stat.ctr, 0);
    return Math.round(total / stats.length);
  }
}