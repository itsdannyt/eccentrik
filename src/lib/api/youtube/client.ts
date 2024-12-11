import axios from 'axios';

const API_BASE_URL = 'http://localhost:5174/api/youtube';
const API_TIMEOUT = 5000;

export class YouTubeClient {
  private static instance: YouTubeClient | null = null;
  private accessToken: string | null = null;

  private constructor() {}

  public static getInstance(): YouTubeClient {
    if (!YouTubeClient.instance) {
      YouTubeClient.instance = new YouTubeClient();
    }
    return YouTubeClient.instance;
  }

  public setAccessToken(token: string) {
    if (!token) {
      throw new Error('Invalid token provided');
    }
    this.accessToken = token;
  }

  private getHeaders() {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }
    const token = this.accessToken.replace(/^Bearer\s+/i, '');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async handleRequest<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        this.accessToken = null;
        throw new Error('YouTube token expired. Please reconnect your YouTube account.');
      }
      throw error;
    }
  }

  private logError(context: string, error: any) {
    console.error(`Error in ${context}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  private shouldUseMockData(error: any) {
    return import.meta.env.DEV && (
      error?.response?.status === 403 || 
      error?.code === 'ECONNREFUSED' || 
      !error.response
    );
  }

  public async getChannelAnalytics() {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    return await this.handleRequest(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/analytics`, {
          headers: this.getHeaders(),
          timeout: API_TIMEOUT
        });
        
        if (!response?.data?.overview) {
          throw new Error('Invalid analytics data received from YouTube');
        }
        
        return response.data;
      } catch (error: any) {
        this.logError('getChannelAnalytics', error);
        
        if (this.shouldUseMockData(error)) {
          return {
            overview: {
              totalViews: '125.4K',
              subscribers: '12.8K',
              totalVideos: '45',
              watchTime: '458.2K',
              engagementRate: '8.5'
            }
          };
        }
        throw error;
      }
    });
  }

  public async getRecentVideos() {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    return await this.handleRequest(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/videos`, {
          headers: this.getHeaders(),
          timeout: API_TIMEOUT
        });

        if (!Array.isArray(response?.data)) {
          throw new Error('Invalid response format from YouTube API');
        }

        return response.data;
      } catch (error: any) {
        this.logError('getRecentVideos', error);
        
        if (this.shouldUseMockData(error)) {
          return [
            {
              id: 'mock1',
              title: 'How to Build a Modern Web App',
              thumbnail: 'https://i.ytimg.com/vi/mock1/maxresdefault.jpg',
              publishedAt: new Date().toISOString(),
              stats: {
                views: '1.2K',
                likes: '156',
                comments: '23'
              },
              analytics: {
                watchTime: '2.5K',
                avgViewDuration: '4:32',
                engagementRate: '8.5'
              },
              insights: [
                {
                  type: 'success',
                  message: 'Strong viewer engagement in first 30 seconds'
                },
                {
                  type: 'improvement',
                  message: 'Consider adding more end cards for retention'
                }
              ]
            },
            {
              id: 'mock2',
              title: 'React Performance Tips & Tricks',
              thumbnail: 'https://i.ytimg.com/vi/mock2/maxresdefault.jpg',
              publishedAt: new Date(Date.now() - 86400000).toISOString(),
              stats: {
                views: '856',
                likes: '92',
                comments: '15'
              },
              analytics: {
                watchTime: '1.8K',
                avgViewDuration: '5:21',
                engagementRate: '7.2'
              },
              insights: [
                {
                  type: 'success',
                  message: 'High retention rate throughout video'
                }
              ]
            }
          ];
        }
        
        if (import.meta.env.DEV) {
          return [];
        }
        throw error;
      }
    });
  }
}