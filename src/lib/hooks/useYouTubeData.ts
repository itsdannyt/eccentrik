import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

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
  const { youtubeToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);

  useEffect(() => {
    async function fetchYouTubeData() {
      if (!youtubeToken) {
        setStats(null);
        setRecentVideos([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5174/api/youtube/analytics', {
          headers: {
            'Authorization': `Bearer ${youtubeToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch YouTube data');
        }

        const data = await response.json();
        
        // Format the stats data
        setStats({
          totalViews: formatNumber(data.overview.totalViews),
          subscribers: formatNumber(data.overview.subscribers),
          totalVideos: formatNumber(data.overview.totalVideos),
          watchTime: formatWatchTime(data.overview.watchTime),
          engagementRate: data.overview.engagementRate + '%'
        });

        // Set recent videos if available
        if (data.recentVideos) {
          setRecentVideos(data.recentVideos.map((video: any) => ({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            publishedAt: video.publishedAt,
            stats: {
              views: formatNumber(video.stats.views),
              likes: formatNumber(video.stats.likes),
              comments: formatNumber(video.stats.comments)
            },
            analytics: {
              watchTime: formatWatchTime(video.analytics.watchTime),
              avgViewDuration: video.analytics.avgViewDuration,
              engagementRate: video.analytics.engagementRate + '%'
            },
            insights: video.insights || []
          })));
        }
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch YouTube data');
        setStats(null);
        setRecentVideos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchYouTubeData();
  }, [youtubeToken]);

  const formattedStats: FormattedStats = stats ? {
    subscribers: formatNumber(stats.subscribers),
    views: formatNumber(stats.totalViews),
    videos: formatNumber(stats.totalVideos),
    watchTime: formatWatchTime(stats.watchTime),
    engagement: stats.engagementRate
  } : null;

  return { stats: formattedStats, recentVideos, loading, error };
}

function formatNumber(num: string): string {
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return num;
}

function formatWatchTime(minutes: string): string {
  const mins = parseInt(minutes);
  if (mins >= 1440) return Math.round(mins / 1440) + ' days';
  if (mins >= 60) return Math.round(mins / 60) + ' hours';
  return mins + ' mins';
}