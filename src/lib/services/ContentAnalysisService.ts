import { OpenAIClient } from '../api/openai/client';
import { VisionClient } from '../api/vision/client';
import { YouTubeClient } from '../api/youtube/client';
import { TitleAnalysis, ThumbnailAnalysis } from '../api/openai/types';
import { CacheService } from './CacheService';
import { ThumbnailAnalysisService } from './ThumbnailAnalysisService';

export class ContentAnalysisService {
  private static instance: ContentAnalysisService;
  private openaiClient: OpenAIClient;
  private visionClient: VisionClient;
  private youtubeClient: YouTubeClient;
  private thumbnailAnalysisService: ThumbnailAnalysisService;
  private cacheService: CacheService;

  private constructor() {
    this.openaiClient = OpenAIClient.getInstance();
    this.visionClient = VisionClient.getInstance();
    this.youtubeClient = YouTubeClient.getInstance();
    this.thumbnailAnalysisService = ThumbnailAnalysisService.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): ContentAnalysisService {
    if (!ContentAnalysisService.instance) {
      ContentAnalysisService.instance = new ContentAnalysisService();
    }
    return ContentAnalysisService.instance;
  }

  async analyzeContent(
    title: string | null,
    thumbnailUrl: string | null,
    channelId: string,
    userId: string
  ): Promise<{
    titleAnalysis: TitleAnalysis | null;
    thumbnailAnalysis: ThumbnailAnalysis | null;
  }> {
    try {
      const cacheKey = `content_analysis:${title}:${thumbnailUrl}`;
      const cached = this.cacheService.get(cacheKey);
      if (cached) return cached;

      const historicalData = await this.youtubeClient.getHistoricalData(channelId, userId);

      let titleAnalysis: TitleAnalysis | null = null;
      let thumbnailAnalysis: ThumbnailAnalysis | null = null;

      // Analyze title if provided
      if (title) {
        titleAnalysis = await this.openaiClient.analyzeTitleWithHistory(title, historicalData);
      }

      // Analyze thumbnail if provided
      if (thumbnailUrl) {
        const { insights } = await this.thumbnailAnalysisService.analyzeThumbnail(
          thumbnailUrl,
          channelId,
          userId
        );
        thumbnailAnalysis = insights;
      }

      const result = { titleAnalysis, thumbnailAnalysis };
      this.cacheService.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error in content analysis:', error);
      throw new Error('Failed to analyze content');
    }
  }
}