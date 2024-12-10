import { supabase } from '../supabase';

interface CachedData {
  data: any;
  timestamp: number;
}

interface RateLimitInfo {
  lastFetch: number;
  count: number;
}

export class YouTubeAPIService {
  private static instance: YouTubeAPIService;
  private cache: Map<string, CachedData>;
  private rateLimits: Map<string, RateLimitInfo>;
  private readonly TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
  private readonly MAX_REQUESTS_PER_WINDOW = 5;

  private constructor() {
    this.cache = new Map();
    this.rateLimits = new Map();
  }

  public static getInstance(): YouTubeAPIService {
    if (!YouTubeAPIService.instance) {
      YouTubeAPIService.instance = new YouTubeAPIService();
    }
    return YouTubeAPIService.instance;
  }

  private async getCachedData(key: string): Promise<any | null> {
    // First check memory cache
    const memoryCache = this.cache.get(key);
    if (memoryCache && Date.now() - memoryCache.timestamp < this.TTL) {
      return memoryCache.data;
    }

    // Then check Supabase cache
    const { data: cacheEntry } = await supabase
      .from('api_cache')
      .select('data, timestamp')
      .eq('key', key)
      .single();

    if (cacheEntry && Date.now() - new Date(cacheEntry.timestamp).getTime() < this.TTL) {
      // Update memory cache
      this.cache.set(key, {
        data: cacheEntry.data,
        timestamp: new Date(cacheEntry.timestamp).getTime()
      });
      return cacheEntry.data;
    }

    return null;
  }

  private async setCachedData(key: string, data: any): Promise<void> {
    // Update memory cache
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Update Supabase cache
    await supabase
      .from('api_cache')
      .upsert({
        key,
        data,
        timestamp: new Date().toISOString()
      });
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRateLimit = this.rateLimits.get(userId) || { lastFetch: 0, count: 0 };

    if (now - userRateLimit.lastFetch > this.RATE_LIMIT_WINDOW) {
      // Reset if window has passed
      userRateLimit.count = 0;
      userRateLimit.lastFetch = now;
    }

    if (userRateLimit.count >= this.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    userRateLimit.count++;
    this.rateLimits.set(userId, userRateLimit);
    return true;
  }

  private async logAPIUsage(userId: string, endpoint: string): Promise<void> {
    await supabase
      .from('api_usage_logs')
      .insert({
        user_id: userId,
        endpoint,
        timestamp: new Date().toISOString()
      });
  }

  public async fetchWithCache(
    userId: string,
    endpoint: string,
    fetchFn: () => Promise<any>
  ): Promise<any> {
    const cacheKey = `${userId}:${endpoint}`;

    // Check rate limit
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    try {
      // Try to get cached data
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch fresh data
      const freshData = await fetchFn();
      
      // Cache the fresh data
      await this.setCachedData(cacheKey, freshData);
      
      // Log API usage
      await this.logAPIUsage(userId, endpoint);

      return freshData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  public async batchFetchVideos(
    userId: string,
    videoIds: string[]
  ): Promise<any[]> {
    const cacheKey = `${userId}:videos:${videoIds.join(',')}`;
    
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    try {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }

      const data = await response.json();
      await this.setCachedData(cacheKey, data.items);
      await this.logAPIUsage(userId, 'videos.list');

      return data.items;
    } catch (error) {
      console.error('Error batch fetching videos:', error);
      throw error;
    }
  }
}