import { OpenAIClient } from '../api/openai/client';
import { YouTubeClient } from '../api/youtube/client';
import { AnalysisResult } from '../api/openai/types';

export class AIService {
  private static instance: AIService;
  private openaiClient: OpenAIClient;
  private youtubeClient: YouTubeClient;

  private constructor() {
    this.openaiClient = OpenAIClient.getInstance();
    this.youtubeClient = YouTubeClient.getInstance();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeContent(
    channelId: string,
    title: string | null,
    thumbnailUrl: string | null
  ): Promise<AnalysisResult> {
    try {
      // Get historical data first
      const historicalData = await this.youtubeClient.getHistoricalData(channelId);

      // Run analyses in parallel if both title and thumbnail are provided
      const [titleAnalysis, thumbnailAnalysis] = await Promise.all([
        title ? this.openaiClient.analyzeTitleWithHistory(title, historicalData) : Promise.resolve(null),
        thumbnailUrl ? this.openaiClient.analyzeThumbnailWithHistory(thumbnailUrl, historicalData) : Promise.resolve(null)
      ]);

      return {
        title: titleAnalysis,
        thumbnail: thumbnailAnalysis
      };
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw error;
    }
  }
}