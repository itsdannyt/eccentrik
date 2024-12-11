import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { withRetry } from '../../utils/api.utils';
import { youtubeConfig } from '../../config/youtube.config';

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

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }

    try {
      const { clientId, clientSecret, redirectUri } = youtubeConfig;
      
      if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing YouTube API configuration');
      }

      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.oauth2Client
      });
      this.youtubeAnalytics = google.youtubeAnalytics({
        version: 'v2',
        auth: this.oauth2Client
      });
    } catch (error) {
      console.error('Error initializing YouTube service:', error);
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
    try {
      // Validate token by making a test API call
      try {
        await this.youtube.channels.list({
          auth: this.oauth2Client,
          part: ['id'],
          mine: true
        });
      } catch (error: any) {
        console.error('Token validation error:', error);
        if (error.code === 401 || (error.response?.status === 401)) {
          throw new Error('YouTube token expired or invalid');
        }
        throw new Error(`Failed to validate YouTube token: ${error.message}`);
      }

      // Continue with analytics if token is valid
      const cacheKey = this.getCacheKey('channelAnalytics', {});
      const cached = this.getFromCache<ChannelAnalytics>(cacheKey);
      if (cached) return cached;

      try {
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
            topVideos: topVideos.map(video => ({
              id: video?.id || '',
              title: video?.title || '',
              views: video?.views || 0,
              likes: video?.likes || 0,
              comments: video?.comments || 0
            }))
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
    } catch (error: any) {
      console.error('Channel analytics error:', error);
      // Preserve the original error message if possible
      throw error instanceof Error ? error : new Error(error.message || 'Failed to fetch channel analytics');
    }
  }

  private async getChannelOverview() {
    const response = await this.youtube.channels.list({
      auth: this.oauth2Client,
      part: ['statistics'],
      mine: true
    });

    if (!response.data.items?.length) {
      throw new Error('No channel data found');
    }

    const stats = response.data.items[0].statistics;

    return {
      totalViews: stats.viewCount || '0',
      subscribers: stats.subscriberCount || '0',
      totalVideos: stats.videoCount || '0',
      engagementRate: this.calculateEngagementRate(stats)
    };
  }

  private async getRecentPerformance() {
    const { startDate, endDate } = this.getDateRange();
    const response = await this.youtubeAnalytics.reports.query({
      auth: this.oauth2Client,
      ids: 'channel==mine',
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscriberGained,subscriberLost',
      dimensions: 'day',
      startDate,
      endDate,
      sort: 'day'
    });

    const data = response.data.rows || [];
    return {
      views: data.map(row => Number(row[1])),
      watchTime: data.map(row => Number(row[2])),
      dates: data.map(row => row[0]),
      averageViewDuration: this.calculateAverageViewDuration(data),
      subscriberChange: this.calculateSubscriberChange(data)
    };
  }

  private async getTopVideos() {
    const response = await this.youtube.search.list({
      auth: this.oauth2Client,
      part: ['snippet', 'statistics'],
      forMine: true,
      type: ['video'],
      order: 'viewCount',
      maxResults: 10
    });

    return (response.data.items || []).map(video => ({
      id: video.id?.videoId || '',
      title: video.snippet?.title || '',
      views: 0, // Will be populated with actual stats
      likes: 0,
      comments: 0
    }));
  }

  private async getDemographics() {
    const response = await this.youtubeAnalytics.reports.query({
      auth: this.oauth2Client,
      ids: 'channel==mine',
      metrics: 'viewerPercentage',
      dimensions: 'ageGroup,country',
      sort: '-viewerPercentage'
    });

    return {
      ageGroups: this.processAgeGroups(response.data.rows || []),
      countries: this.processCountries(response.data.rows || [])
    };
  }

  private async getTrafficSources() {
    const response = await this.youtubeAnalytics.reports.query({
      auth: this.oauth2Client,
      ids: 'channel==mine',
      metrics: 'views',
      dimensions: 'insightTrafficSourceType,deviceType',
      sort: '-views'
    });

    return {
      sources: this.processTrafficSources(response.data.rows || []),
      devices: this.processDevices(response.data.rows || [])
    };
  }

  // Helper methods
  private getDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 28);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
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
