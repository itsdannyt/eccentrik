import { VisionClient } from '../api/vision/client';
import { OpenAIClient } from '../api/openai/client';
import { ImageAnalysis } from '../api/vision/types';
import { ThumbnailAnalysis } from '../api/openai/types';
import { CacheService } from './CacheService';
import { YouTubeClient } from '../api/youtube/client';

export class ThumbnailAnalysisService {
  private static instance: ThumbnailAnalysisService;
  private visionClient: VisionClient;
  private openaiClient: OpenAIClient;
  private youtubeClient: YouTubeClient;
  private cacheService: CacheService;

  private constructor() {
    this.visionClient = VisionClient.getInstance();
    this.openaiClient = OpenAIClient.getInstance();
    this.youtubeClient = YouTubeClient.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): ThumbnailAnalysisService {
    if (!ThumbnailAnalysisService.instance) {
      ThumbnailAnalysisService.instance = new ThumbnailAnalysisService();
    }
    return ThumbnailAnalysisService.instance;
  }

  async analyzeThumbnail(thumbnailUrl: string, channelId: string, userId: string): Promise<{
    visionAnalysis: ImageAnalysis;
    insights: ThumbnailAnalysis;
  }> {
    if (!thumbnailUrl) {
      throw new Error('Thumbnail URL is required');
    }

    // Check cache first
    const cacheKey = `thumbnail_analysis:${thumbnailUrl}`;
    const cachedResult = this.cacheService.get<{
      visionAnalysis: ImageAnalysis;
      insights: ThumbnailAnalysis;
    }>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Get Vision AI analysis
      const visionAnalysis = await this.visionClient.analyzeThumbnail(thumbnailUrl);

      // Get historical data for context
      const historicalData = await this.youtubeClient.getHistoricalData(channelId, userId);

      // Generate insights using OpenAI based on Vision AI results and historical data
      const insights = await this.openaiClient.analyzeThumbnailWithHistory(
        visionAnalysis,
        historicalData
      );

      const result = { visionAnalysis, insights };
      
      // Cache the result
      this.cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in thumbnail analysis';
      console.error('Thumbnail analysis error:', message);
      throw new Error(`Failed to analyze thumbnail: ${message}`);
    }
  }
}