import { useState } from 'react';
import { ContentAnalysisService } from '../services/ContentAnalysisService';
import { AnalysisResult } from '../api/openai/types';
import { useAuth } from '../auth/AuthProvider';

export function useContentAnalysis() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContent = async (
    title: string | null,
    thumbnailUrl: string | null
  ): Promise<AnalysisResult> => {
    if (!title && !thumbnailUrl) {
      throw new Error('Either title or thumbnail is required');
    }

    if (!user?.user_metadata?.channel_id) {
      throw new Error('Channel ID not found');
    }

    setLoading(true);
    setError(null);

    try {
      const analysisService = ContentAnalysisService.getInstance();
      const result = await analysisService.analyzeContent(
        title,
        thumbnailUrl,
        user.user_metadata.channel_id,
        user.id
      );

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze content';
      setError(message);
      console.error('Error generating insights:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeContent,
    loading,
    error
  };
}