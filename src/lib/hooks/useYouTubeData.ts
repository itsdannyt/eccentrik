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
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch YouTube data: ${response.status} ${response.statusText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          throw new Error('Invalid response format from YouTube API');
        }

        // Validate data structure
        if (!data?.overview) {
          console.error('Invalid data structure:', data);
          throw new Error('Invalid data structure from YouTube API');
        }

        // Format the stats data with fallbacks
        setStats({
          totalViews: formatNumber(data.overview.totalViews || '0'),
          subscribers: formatNumber(data.overview.subscribers || '0'),
          totalVideos: formatNumber(data.overview.totalVideos || '0'),
          watchTime: formatWatchTime(data.overview.watchTime || '0'),
          engagementRate: (data.overview.engagementRate || '0') + '%'
        });

        // Set recent videos if available with validation
        if (Array.isArray(data.recentVideos)) {
          setRecentVideos(data.recentVideos.map((video: any) => ({
            id: video.id || '',
            title: video.title || '',
            thumbnail: video.thumbnail || '',
            publishedAt: video.publishedAt || '',
            stats: {
              views: formatNumber(video.stats?.views || '0'),
              likes: formatNumber(video.stats?.likes || '0'),
              comments: formatNumber(video.stats?.comments || '0')
            },
            analytics: {
              watchTime: formatWatchTime(video.analytics?.watchTime || '0'),
              avgViewDuration: video.analytics?.avgViewDuration || '0:00',
              engagementRate: (video.analytics?.engagementRate || '0') + '%'
            },
            insights: Array.isArray(video.insights) ? video.insights : []
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

  const formattedStats: FormattedStats | null = stats ? {
    subscribers: formatNumber(stats.subscribers || '0'),
    views: formatNumber(stats.totalViews || '0'),
    videos: formatNumber(stats.totalVideos || '0'),
    watchTime: formatWatchTime(stats.watchTime || '0'),
    engagement: stats.engagementRate || '0%'
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