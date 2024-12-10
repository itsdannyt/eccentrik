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

  private calculateCTR(stats: any): number {
    const views = parseInt(stats.viewCount) || 0;
    const impressions = views * 1.5; // Estimated impression count
    return Math.round((views / impressions) * 100);
  }

  private async executeRequest(endpoint: string, params: Record<string, any>) {
    try {
      // Build the YouTube API URL with parameters
      const youtubeUrl = new URL(`${BASE_URL}/${endpoint}`);
      youtubeUrl.searchParams.append('key', YOUTUBE_API_KEY);
      for (const [key, value] of Object.entries(params)) {
        youtubeUrl.searchParams.append(key, String(value));
      }

      // Use allorigins.win as a CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(youtubeUrl.toString())}`;
      
      const response = await axios.get(proxyUrl);
      
      // allorigins returns the response in a 'contents' property as a string
      const contents = JSON.parse(response.data.contents);
      return contents;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('YouTube API Error:', {
          message: error.message,
          response: error.response?.data
        });
        throw new Error(error.response?.data?.error?.message || 'Failed to fetch data from YouTube API');
      }
      throw error;
    }
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

  private async get30DayAnalytics(channelId: string, userId: string) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const analyticsResponse = await this.rateLimitService.executeWithRetry(userId, async () => {
      return this.executeRequest('youtubeAnalytics/v2/reports', {
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments',
        dimensions: 'day'
      });
    });

    return analyticsResponse.data;
  }

  async getHistoricalData(channelId: string, userId: string): Promise<HistoricalData> {
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    const cacheKey = `historical_${channelId}`;
    const cached = this.cacheService.get<HistoricalData>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch current channel statistics and analytics
      const [channelData, analyticsData] = await Promise.all([
        this.executeRequest('channels', {
          id: channelId,
          part: 'statistics,contentDetails,snippet',
          fields: 'items(statistics,contentDetails/relatedPlaylists/uploads,snippet/title)'
        }),
        this.get30DayAnalytics(channelId, userId)
      ]);

      if (!channelData?.items?.length) {
        throw new Error('Channel not found');
      }

      const channel = channelData.items[0];
      const statistics = channel.statistics;
      const channelTitle = channel.snippet.title;
      const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

      // Get recent videos
      const videos = await this.getPlaylistItems(uploadsPlaylistId, userId);
      const videoIds = videos.map((v: any) => v.snippet.resourceId.videoId);

      // Get video statistics
      const stats = await this.getVideoStatsBatched(videoIds, userId);

      // Calculate metrics
      const thirtyDayMetrics = {
        views: analyticsData.rows.reduce((sum: number, row: number[]) => sum + row[0], 0),
        watchTime: analyticsData.rows.reduce((sum: number, row: number[]) => sum + row[1], 0),
        subscribersGained: analyticsData.rows.reduce((sum: number, row: number[]) => sum + row[3], 0),
        subscribersLost: analyticsData.rows.reduce((sum: number, row: number[]) => sum + row[4], 0),
        likes: analyticsData.rows.reduce((sum: number, row: number[]) => sum + row[5], 0),
        comments: analyticsData.rows.reduce((sum: number, row: number[]) => sum + row[6], 0),
      };

      const historicalData: HistoricalData = {
        channelTitle,
        statistics: {
          ...statistics,
          thirtyDayMetrics,
          engagementRate: ((thirtyDayMetrics.likes + thirtyDayMetrics.comments) / thirtyDayMetrics.views * 100).toFixed(1)
        },
        averageCTR: this.calculateAverageCTR(stats),
        topPerformingVideos: this.extractTopVideos(videos, stats),
        highPerformingKeywords: this.extractKeywords(videos),
        thumbnailTraits: {
          hasText: true,
          hasContrast: true,
          hasFaces: true
        }
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

    const response = await this.rateLimitService.executeWithRetry(userId, async () => {
      return this.executeRequest('channels', {
        id: channelId,
        part: 'statistics',
        fields: 'items(statistics)',
        publishedBefore: thirtyDaysAgo.toISOString()
      });
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

    const response = await this.rateLimitService.executeWithRetry(userId, async () => {
      return this.executeRequest('videos', {
        id: videoId,
        part: 'statistics',
        fields: 'items(statistics)',
        ...(publishedBefore && { publishedBefore })
      });
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
      const response = await this.rateLimitService.executeWithRetry(userId, async () => {
        return this.executeRequest('playlistItems', {
          playlistId,
          part: 'snippet',
          maxResults: batchSize,
          pageToken
        });
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
        this.rateLimitService.executeWithRetry(userId, async () => {
          const response = await this.executeRequest('videos', {
            id: batch.join(','),
            part: 'statistics',
            fields: 'items(statistics)'
          });
          return response.data.items;
        })
      )
    );

    return results.flat().map(item => ({
      viewCount: item.statistics.viewCount || '0',
      likeCount: item.statistics.likeCount || '0',
      commentCount: item.statistics.commentCount || '0',
      ctr: this.calculateCTR(item.statistics)
    }));
  }
}