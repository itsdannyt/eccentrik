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

  public async getChannelAnalytics() {
    try {
      const response = await axios.get('/api/youtube/analytics', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching channel analytics:', error);
      throw error;
    }
  }

  public async getRecentVideos() {
    try {
      const response = await axios.get('/api/youtube/videos', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      throw error;
    }
  }
}