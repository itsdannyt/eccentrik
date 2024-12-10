import { z } from 'zod';

export interface VideoStats {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  ctr: number;
}

export interface HistoricalData {
  averageCTR: number;
  topPerformingVideos: Array<{
    title: string;
    ctr: number;
    engagement: number;
  }>;
  highPerformingKeywords: string[];
  thumbnailTraits: {
    hasText: boolean;
    hasContrast: boolean;
    hasFaces: boolean;
  };
}

export const videoStatsSchema = z.object({
  viewCount: z.string(),
  likeCount: z.string(),
  commentCount: z.string(),
  ctr: z.number()
});

export const historicalDataSchema = z.object({
  averageCTR: z.number(),
  topPerformingVideos: z.array(z.object({
    title: z.string(),
    ctr: z.number(),
    engagement: z.number()
  })),
  highPerformingKeywords: z.array(z.string()),
  thumbnailTraits: z.object({
    hasText: z.boolean(),
    hasContrast: z.boolean(),
    hasFaces: z.boolean()
  })
});