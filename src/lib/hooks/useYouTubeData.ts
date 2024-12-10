import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { YouTubeClient } from '../api/youtube/client';

interface YouTubeStats {
  totalViews: string;
  subscribers: string;
  totalVideos: string;
  watchTime: string;
  engagementRate: string;
}

interface RecentVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  stats: {
    views: string;
    likes: string;
    comments: string;
  };
  analytics: {
    watchTime: string;
    avgViewDuration: string;
    engagementRate: string;
  };
  insights: Array<{
    type: 'improvement' | 'success';
    message: string;
  }>;
}

interface FormattedStats {
  subscribers: string;
  views: string;
  videos: string;
  watchTime: string;
  engagement: string;
}

export function useYouTubeData() {
  const { user, youtubeToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<YouTubeStats>({
    totalViews: '0',
    subscribers: '0',
    totalVideos: '0',
    watchTime: '0',
    engagementRate: '0'
  });
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!youtubeToken) {
        setError('YouTube access token not found. Please connect your YouTube account.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const client = YouTubeClient.getInstance();
        client.setAccessToken(youtubeToken);

        // Fetch channel analytics
        const analytics = await client.getChannelAnalytics();
        setStats(analytics.overview);

        // Fetch recent videos
        const videos = await client.getRecentVideos();
        setRecentVideos(videos);
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        setError('Failed to fetch YouTube data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [youtubeToken]);

  const formattedStats: FormattedStats = {
    subscribers: formatNumber(stats.subscribers),
    views: formatNumber(stats.totalViews),
    videos: formatNumber(stats.totalVideos),
    watchTime: formatWatchTime(stats.watchTime),
    engagement: `${stats.engagementRate}%`
  };

  return {
    loading,
    error,
    stats: formattedStats,
    recentVideos,
  };
}

function formatNumber(num: string): string {
  const n = parseInt(num);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return num;
}

function formatWatchTime(minutes: string): string {
  const mins = parseInt(minutes);
  const hours = Math.floor(mins / 60);
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}K hrs`;
  if (hours > 0) return `${hours} hrs`;
  return `${mins} mins`;
}