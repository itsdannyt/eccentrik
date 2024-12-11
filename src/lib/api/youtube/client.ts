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
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  public async getChannelAnalytics() {
    try {
      if (!this.accessToken) {
        throw new Error('Access token not set. Please authenticate first.');
      }

      console.log('Fetching channel analytics with token:', this.accessToken.substring(0, 10) + '...');
      const response = await axios.get('/api/youtube/analytics', {
        headers: this.getHeaders()
      });
      return response.data;
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
      const response = await axios.get('/api/youtube/videos', {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      throw error;
    }
  }
}