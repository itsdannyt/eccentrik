import { useState, useEffect } from 'react';
import { useYouTubeData } from './useYouTubeData';

interface Insight {
  id: string;
  title: string;
  description: string;
  action: string;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

export function useChannelInsights() {
  const { stats, loading, error } = useYouTubeData();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (loading || error || !stats) return;

    const subCount = parseInt(stats.subscriberCount);
    const viewCount = parseInt(stats.viewCount);
    const videoCount = parseInt(stats.videoCount);

    const newInsights: Insight[] = [];

    // Only add insights if we have real data
    if (subCount > 0) {
      // Subscriber milestone insight
      const nextMilestone = Math.ceil(subCount / 1000) * 1000;
      newInsights.push({
        id: 'subscriber-milestone',
        title: 'Growing Audience',
        description: `You're ${nextMilestone - subCount} subscribers away from ${nextMilestone}! Keep creating engaging content.`,
        action: 'View Growth Tips',
        link: '/dashboard/trends',
        priority: 'high'
      });

      // Engagement insight
      if (viewCount > 0) {
        const viewPerSub = viewCount / subCount;
        if (viewPerSub < 0.5) {
          newInsights.push({
            id: 'engagement',
            title: 'Boost Engagement',
            description: 'Try posting at different times or creating more engaging thumbnails to increase views.',
            action: 'Optimize Content',
            link: '/dashboard/video-analysis',
            priority: 'medium'
          });
        }
      }
    }

    setInsights(newInsights);
  }, [stats, loading, error]);

  return {
    insights,
    loading,
    error
  };
}