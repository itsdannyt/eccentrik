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

  public async getChannelAnalytics() {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    return await this.handleRequest(async () => {
      try {
        console.log('Fetching analytics with token:', this.accessToken?.substring(0, 10) + '...');
        const response = await axios.get(`${API_BASE_URL}/analytics`, {
          headers: this.getHeaders(),
          timeout: API_TIMEOUT
        });
        
        console.log('Raw analytics response:', response.data);
        
        if (!response?.data?.overview) {
          throw new Error('Invalid analytics data received from YouTube');
        }
        
        return response.data;
      } catch (error: any) {
        this.logError('getChannelAnalytics', error);
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
        const response = await axios.get(`${API_BASE_URL}/videos/recent`, {
          headers: this.getHeaders(),
          timeout: API_TIMEOUT
        });

        if (!Array.isArray(response.data)) {
          throw new Error('Invalid video data received from YouTube');
        }

        return response.data;
      } catch (error: any) {
        this.logError('getRecentVideos', error);
        throw error;
      }
    });
  }
}