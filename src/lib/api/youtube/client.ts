import axios from 'axios';
import { useAuth } from '../../auth/AuthProvider';

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
    
    // Remove any existing Bearer prefix and add it cleanly
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
        // Clear the token on auth errors
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