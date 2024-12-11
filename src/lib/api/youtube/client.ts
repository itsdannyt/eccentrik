import axios from 'axios';

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
    this.accessToken = token;
  }

  private getHeaders() {
    // Check if the token already includes 'Bearer'
    const token = this.accessToken?.startsWith('Bearer ') 
      ? this.accessToken 
      : `Bearer ${this.accessToken}`;
      
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  }

  private async handleRequest<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Token might be expired, clear it
        this.accessToken = null;
        throw new Error('YouTube token expired. Please reconnect your YouTube account.');
      }
      throw error;
    }
  }

  public async getChannelAnalytics() {
    try {
      if (!this.accessToken) {
        throw new Error('Access token not set. Please authenticate first.');
      }

      console.log('Fetching channel analytics with token:', this.accessToken.substring(0, 10) + '...');
      return await this.handleRequest(async () => {
        const response = await axios.get('/api/youtube/analytics', {
          headers: this.getHeaders()
        });
        return response.data;
      });
    } catch (error) {
      console.error('Error fetching channel analytics:', error);
      throw error;
    }
  }

  public async getRecentVideos() {
    try {
      if (!this.accessToken) {
        throw new Error('Access token not set. Please authenticate first.');
      }

      console.log('Fetching recent videos with token:', this.accessToken.substring(0, 10) + '...');
      return await this.handleRequest(async () => {
        const response = await axios.get('/api/youtube/videos', {
          headers: this.getHeaders()
        });
        return response.data;
      });
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      throw error;
    }
  }
}