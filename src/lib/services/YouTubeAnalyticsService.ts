import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { withRetry } from '../../utils/api.utils';
import { youtubeConfig } from '../../config/youtube.config';
import { createOAuth2Client, createYouTubeClients } from '../../config/oauth.config';
import { YOUTUBE_SCOPES } from '../../config/oauth.config';

interface ChannelAnalytics {
  overview: {
    totalViews: string;
    subscribers: string;
    totalVideos: string;
    engagementRate: string;
  };
  recentPerformance: {
    views: number[];
    watchTime: number[];
    dates: string[];
    averageViewDuration: number;
    subscriberChange: number;
  };
  topVideos: {
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
  }[];
  demographics: {
    ageGroups: Record<string, number>;
    countries: Record<string, number>;
  };
  traffic: {
    sources: Record<string, number>;
    devices: Record<string, number>;
  };
}

export class YouTubeAnalyticsService {
  private youtube;
  private youtubeAnalytics;
  private oauth2Client: OAuth2Client;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private accessToken: string;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }
    this.accessToken = accessToken;
  }

  async initialize(): Promise<void> {
    console.log('\n=== YouTubeAnalyticsService Initialization ===');
    
    try {
      // Create OAuth2 client using shared configuration
      this.oauth2Client = createOAuth2Client();
      console.log('OAuth2Client created successfully');
      
      // Set credentials with scopes
      this.oauth2Client.setCredentials({
        access_token: this.accessToken,
        scope: YOUTUBE_SCOPES.join(' ')
      });
      console.log('Access token and scopes set:', this.accessToken.substring(0, 10) + '...');

      // Initialize YouTube clients
      const clients = createYouTubeClients(this.oauth2Client);
      this.youtube = clients.youtube;
      this.youtubeAnalytics = clients.youtubeAnalytics;
      console.log('YouTube clients created successfully');
      
      // Verify API access
      console.log('Verifying API access...');
      try {
        const testResponse = await this.youtube.channels.list({
          part: ['snippet,statistics'],
          mine: true
        });
        
        if (!testResponse.data.items?.length) {
          throw new Error('No channel data found');
        }
        
        console.log('API access verified successfully:', {
          status: testResponse.status,
          channelId: testResponse.data.items[0].id,
          title: testResponse.data.items[0].snippet?.title
        });
      } catch (error: any) {
        console.error('API verification failed:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        // Check if token needs refresh
        if (error.response?.status === 401) {
          console.log('Token expired, attempting to refresh...');
          try {
            const response = await fetch('/api/youtube/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ accessToken: this.accessToken })
            });

            if (!response.ok) {
              throw new Error('Failed to refresh token');
            }

            const { accessToken } = await response.json();
            this.accessToken = accessToken;
            
            // Retry initialization with new token
            return this.initialize();
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('YouTube authentication expired. Please reconnect your account.');
          }
        }

        throw new Error('Failed to verify YouTube API access: ' + (error.response?.data?.error?.message || error.message));
      }
    } catch (error: any) {
      console.error('Initialization failed:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      throw error;
    }
    
    console.log('=== Initialization Complete ===\n');
  }

  async validateToken(): Promise<void> {
    try {
      await this.youtube.channels.list({
        part: ['id'],
        mine: true
      });
    } catch (error: any) {
      console.error('Token validation error:', error);
      if (error.code === 401 || (error.response?.status === 401)) {
        throw new Error('YouTube token expired or invalid');
      }
      throw error;
    }
  }

  private getCacheKey(method: string, params: any): string {
    return `${method}-${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getChannelAnalytics(): Promise<ChannelAnalytics> {
    await this.validateToken();

    try {
      const cacheKey = this.getCacheKey('channelAnalytics', {});
      const cached = this.getFromCache<ChannelAnalytics>(cacheKey);
      if (cached) return cached;

      const data = await withRetry(async () => {
        const [channelData, performanceData, demographicsData, trafficData] = await Promise.all([
          this.getChannelOverview().catch(err => {
            console.error('Channel overview error:', err);
            return {
              totalViews: '0',
              subscribers: '0',
              totalVideos: '0',
              engagementRate: '0'
            };
          }),
          this.getRecentPerformance().catch(err => {
            console.error('Recent performance error:', err);
            return {
              views: [],
              watchTime: [],
              dates: [],
              averageViewDuration: 0,
              subscriberChange: 0
            };
          }),
          this.getDemographics().catch(err => {
            console.error('Demographics error:', err);
            return { ageGroups: {}, countries: {} };
          }),
          this.getTrafficSources().catch(err => {
            console.error('Traffic sources error:', err);
            return { sources: {}, devices: {} };
          })
        ]);

        let topVideos = [];
        try {
          topVideos = await this.getTopVideos();
        } catch (err) {
          console.error('Top videos error:', err);
          topVideos = []; // Ensure it's an empty array on error
        }

        const analytics: ChannelAnalytics = {
          overview: {
            totalViews: channelData.totalViews || '0',
            subscribers: channelData.subscribers || '0',
            totalVideos: channelData.totalVideos || '0',
            engagementRate: channelData.engagementRate || '0'
          },
          recentPerformance: {
            views: performanceData.views || [],
            watchTime: performanceData.watchTime || [],
            dates: performanceData.dates || [],
            averageViewDuration: performanceData.averageViewDuration || 0,
            subscriberChange: performanceData.subscriberChange || 0
          },
          demographics: {
            ageGroups: demographicsData.ageGroups || {},
            countries: demographicsData.countries || {}
          },
          traffic: {
            sources: trafficData.sources || {},
            devices: trafficData.devices || {}
          },
          topVideos: topVideos
        };

        this.setCache(cacheKey, analytics);
        return analytics;
      });

      return data;
    } catch (error: any) {
      console.error('Data fetching error:', error);
      if (error.response?.status === 401) {
        throw new Error('YouTube authentication failed. Please reconnect your account.');
      }
      throw new Error(error.message || 'Failed to fetch YouTube analytics');
    }
  }

  private async getChannelOverview() {
    console.log('Fetching channel overview...');
    
    // Initialize service if not already initialized
    if (!this.youtube || !this.youtubeAnalytics) {
      await this.initialize();
    }

    // Get basic channel statistics
    const channelResponse = await this.youtube.channels.list({
      part: ['statistics,contentDetails'],
      mine: true
    });

    if (!channelResponse.data.items?.length) {
      throw new Error('No channel data found');
    }

    const channelStats = channelResponse.data.items[0].statistics;
    const channelId = channelResponse.data.items[0].id;

    // Get analytics data for the past 30 days
    const { startDate, endDate } = this.getDateRange();
    const analyticsResponse = await this.youtubeAnalytics.reports.query({
      ids: 'channel==' + channelId,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,comments',
      dimensions: 'day',
      startDate,
      endDate
    });

    if (!analyticsResponse.data.rows?.length) {
      console.warn('No analytics data found for the period');
    }

    // Calculate total views for the period
    const periodViews = analyticsResponse.data.rows?.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0) || 0;

    // Calculate engagement metrics
    const likes = analyticsResponse.data.rows?.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0) || 0;
    const comments = analyticsResponse.data.rows?.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0) || 0;
    const engagementRate = ((likes + comments) / (periodViews || 1) * 100).toFixed(2);

    console.log('Channel overview data:', {
      views: periodViews,
      subscribers: channelStats.subscriberCount,
      videos: channelStats.videoCount,
      engagement: engagementRate
    });

    return {
      totalViews: periodViews.toString(),
      subscribers: channelStats.subscriberCount,
      totalVideos: channelStats.videoCount,
      engagementRate: engagementRate
    };
  }

  private async getTopVideos() {
    console.log('Fetching top videos...');
    
    // First get the list of videos
    const searchResponse = await this.youtube.search.list({
      auth: this.oauth2Client,
      part: ['snippet'],
      forMine: true,
      type: ['video'],
      order: 'viewCount',
      maxResults: 10
    });

    if (!searchResponse.data.items?.length) {
      console.log('No videos found');
      return [];
    }

    // Get video IDs
    const videoIds = searchResponse.data.items.map(item => item.id?.videoId).filter(Boolean);
    
    // Get detailed statistics for these videos
    const statsResponse = await this.youtube.videos.list({
      auth: this.oauth2Client,
      part: ['statistics', 'snippet'],
      id: videoIds
    });

    console.log('Top videos fetched successfully');

    return (statsResponse.data.items || []).map(video => ({
      id: video.id || '',
      title: video.snippet?.title || '',
      views: parseInt(video.statistics?.viewCount || '0'),
      likes: parseInt(video.statistics?.likeCount || '0'),
      comments: parseInt(video.statistics?.commentCount || '0')
    }));
  }

  private async getRecentPerformance() {
    console.log('Fetching recent performance...');
    const { startDate, endDate } = this.getDateRange();
    
    try {
      const response = await this.youtubeAnalytics.reports.query({
        auth: this.oauth2Client,
        ids: 'channel==MINE',
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost',
        dimensions: 'day',
        startDate,
        endDate,
        sort: 'day'
      });

      console.log('Recent performance data:', response.data);

      if (!response.data.rows?.length) {
        console.log('No performance data available');
        return {
          views: [],
          watchTime: [],
          dates: [],
          averageViewDuration: 0,
          subscriberChange: 0
        };
      }

      const data = response.data.rows;
      return {
        views: data.map(row => Number(row[1] || 0)),
        watchTime: data.map(row => Number(row[2] || 0)),
        dates: data.map(row => row[0]),
        averageViewDuration: this.calculateAverageViewDuration(data),
        subscriberChange: this.calculateSubscriberChange(data)
      };
    } catch (error: any) {
      console.error('Error fetching recent performance:', error.response?.data || error);
      throw error;
    }
  }

  private async getDemographics() {
    console.log('Fetching demographics...');
    const { startDate, endDate } = this.getDateRange();
    
    try {
      const response = await this.youtubeAnalytics.reports.query({
        auth: this.oauth2Client,
        ids: 'channel==MINE',
        metrics: 'viewerPercentage',
        dimensions: 'ageGroup,country',
        sort: '-viewerPercentage',
        startDate,
        endDate
      });

      console.log('Demographics data:', response.data);

      if (!response.data.rows?.length) {
        console.log('No demographics data available');
        return {
          ageGroups: {},
          countries: {}
        };
      }

      return {
        ageGroups: this.processAgeGroups(response.data.rows),
        countries: this.processCountries(response.data.rows)
      };
    } catch (error: any) {
      console.error('Error fetching demographics:', error.response?.data || error);
      throw error;
    }
  }

  private async getTrafficSources() {
    console.log('Fetching traffic sources...');
    const { startDate, endDate } = this.getDateRange();
    
    try {
      const response = await this.youtubeAnalytics.reports.query({
        auth: this.oauth2Client,
        ids: 'channel==MINE',
        metrics: 'views',
        dimensions: 'insightTrafficSourceType,deviceType',
        sort: '-views',
        startDate,
        endDate
      });

      console.log('Traffic sources data:', response.data);

      if (!response.data.rows?.length) {
        console.log('No traffic data available');
        return {
          sources: {},
          devices: {}
        };
      }

      return {
        sources: this.processTrafficSources(response.data.rows),
        devices: this.processDevices(response.data.rows)
      };
    } catch (error: any) {
      console.error('Error fetching traffic sources:', error.response?.data || error);
      throw error;
    }
  }

  // Helper methods
  private getDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 28); // Last 28 days
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  }

  private calculateEngagementRate(stats: any): string {
    if (!stats?.viewCount) return '0';
    const interactions = (parseInt(stats.likeCount || '0') + parseInt(stats.commentCount || '0'));
    const views = parseInt(stats.viewCount);
    return ((interactions / views) * 100).toFixed(2);
  }

  private calculateAverageViewDuration(data: any[]): number {
    if (!data.length) return 0;
    return data.reduce((acc, row) => acc + Number(row[3]), 0) / data.length;
  }

  private calculateSubscriberChange(data: any[]): number {
    if (!data.length) return 0;
    return data.reduce((acc, row) => acc + (Number(row[4]) - Number(row[5])), 0);
  }

  private processAgeGroups(data: any[]): Record<string, number> {
    return data.reduce((acc, [age, , percentage]) => {
      acc[age] = Number(percentage);
      return acc;
    }, {});
  }

  private processCountries(data: any[]): Record<string, number> {
    return data.reduce((acc, [, country, percentage]) => {
      acc[country] = Number(percentage);
      return acc;
    }, {});
  }

  private processTrafficSources(data: any[]): Record<string, number> {
    return data.reduce((acc, [source, , views]) => {
      acc[source] = Number(views);
      return acc;
    }, {});
  }

  private processDevices(data: any[]): Record<string, number> {
    return data.reduce((acc, [, device, views]) => {
      acc[device] = Number(views);
      return acc;
    }, {});
  }
}
