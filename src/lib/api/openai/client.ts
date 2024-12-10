import OpenAI from 'openai';
import { TitleAnalysis, ThumbnailAnalysis } from './types';
import { HistoricalData } from '../youtube/types';
import { ImageAnalysis } from '../vision/types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class OpenAIClient {
  private static instance: OpenAIClient;

  private constructor() {}

  public static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async analyzeTitleWithHistory(
    title: string,
    historicalData: HistoricalData
  ): Promise<TitleAnalysis> {
    try {
      const prompt = this.buildTitlePrompt(title, historicalData);
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube optimization expert. Analyze titles based on historical performance data.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      return this.parseTitleAnalysis(response.choices[0].message.content || '');
    } catch (error) {
      console.error('Error analyzing title:', error);
      throw error;
    }
  }

  async analyzeThumbnailWithHistory(
    thumbnailAnalysis: ImageAnalysis,
    historicalData: HistoricalData
  ): Promise<ThumbnailAnalysis> {
    try {
      const prompt = this.buildThumbnailPrompt(thumbnailAnalysis, historicalData);
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube thumbnail optimization expert. Analyze thumbnails based on visual analysis and historical performance data.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      return this.parseThumbnailAnalysis(response.choices[0].message.content || '');
    } catch (error) {
      console.error('Error analyzing thumbnail:', error);
      throw error;
    }
  }

  private buildTitlePrompt(title: string, historicalData: HistoricalData): string {
    return `Analyze the following YouTube video title: "${title}"

Historical Performance Data:
1. Average CTR: ${historicalData.averageCTR}%
2. Top-performing titles:
${historicalData.topPerformingVideos
  .slice(0, 3)
  .map(v => `   - "${v.title}" (CTR: ${v.ctr}%)`)
  .join('\n')}
3. High-performing keywords: ${historicalData.highPerformingKeywords.join(', ')}

Provide:
1. A CTR score prediction (1-100)
2. A brief explanation
3. 2-3 specific improvements`;
  }

  private buildThumbnailPrompt(analysis: ImageAnalysis, historicalData: HistoricalData): string {
    const {
      textDetection,
      colorAnalysis,
      composition
    } = analysis;

    return `Analyze this YouTube thumbnail with the following characteristics:

Text Analysis:
- Contains text: ${textDetection.hasText}
- Number of text blocks: ${textDetection.textBlocks}
- Detected text: "${textDetection.detectedText}"

Color Analysis:
- Dominant colors: ${colorAnalysis.dominantColors.map(c => c.rgb).join(', ')}
- Colorfulness score: ${colorAnalysis.colorfulness}
- Contrast score: ${colorAnalysis.contrast}

Composition:
- Contains faces: ${composition.hasFaces}
- Number of faces: ${composition.faceCount}
- Detected objects: ${composition.objects.join(', ')}
- Is cluttered: ${composition.isCluttered}

Historical Performance:
- Average CTR: ${historicalData.averageCTR}%
- Successful thumbnail traits:
  - Text usage: ${historicalData.thumbnailTraits.hasText}
  - High contrast: ${historicalData.thumbnailTraits.hasContrast}
  - Faces: ${historicalData.thumbnailTraits.hasFaces}

Based on these metrics and YouTube best practices:
1. Provide a score (0-100)
2. List 3 specific improvements to increase CTR
3. Explain the reasoning behind each suggestion`;
  }

  private parseTitleAnalysis(response: string): TitleAnalysis {
    try {
      const lines = response.split('\n');
      const scoreMatch = response.match(/score.*?(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

      const suggestions = lines
        .filter(line => line.match(/^[-•*]\s/))
        .map(line => line.replace(/^[-•*]\s/, ''))
        .filter(Boolean)
        .slice(0, 3);

      const explanation = lines
        .find(line => !line.match(/^[-•*]\s/) && line.length > 20)
        ?.trim() || "Analysis based on historical performance and best practices";

      return {
        score,
        explanation,
        suggestions: suggestions.length ? suggestions : [
          "Add numbers for specificity",
          "Include emotional triggers",
          "Use power words"
        ]
      };
    } catch (error) {
      console.error('Error parsing title analysis:', error);
      return {
        score: 75,
        explanation: "Analysis based on historical performance and best practices",
        suggestions: [
          "Add numbers for specificity",
          "Include emotional triggers",
          "Use power words"
        ]
      };
    }
  }

  private parseThumbnailAnalysis(response: string): ThumbnailAnalysis {
    try {
      const lines = response.split('\n');
      const scoreMatch = response.match(/score.*?(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

      const suggestions = lines
        .filter(line => line.match(/^[-•*]\s/))
        .map(line => line.replace(/^[-•*]\s/, ''))
        .filter(Boolean)
        .slice(0, 3);

      const explanation = lines
        .find(line => !line.match(/^[-•*]\s/) && line.length > 20)
        ?.trim() || "Analysis based on visual elements and historical performance";

      return {
        score,
        explanation,
        suggestions: suggestions.length ? suggestions : [
          "Increase text contrast",
          "Simplify composition",
          "Add emotional elements"
        ]
      };
    } catch (error) {
      console.error('Error parsing thumbnail analysis:', error);
      return {
        score: 75,
        explanation: "Analysis based on visual elements and historical performance",
        suggestions: [
          "Increase text contrast",
          "Simplify composition",
          "Add emotional elements"
        ]
      };
    }
  }
}