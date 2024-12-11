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
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    async function fetchYouTubeData() {
      if (!youtubeToken) {
        console.log('[useYouTubeData] No YouTube token available');
        setStats(null);
        setRecentVideos([]);
        setLoading(false);
        return;
      }

      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        console.log('[useYouTubeData] Making API request with token:', youtubeToken.substring(0, 10) + '...');
        const response = await fetch('/api/youtube/analytics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${youtubeToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useYouTubeData] API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Failed to fetch YouTube data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[useYouTubeData] Raw API response:', data);

        if (!data?.overview) {
          console.error('[useYouTubeData] Invalid data structure:', data);
          throw new Error('Invalid data structure received from YouTube API');
        }

        if (!isMounted) return;
        
        // Set stats with actual data, no placeholders
        const newStats: YouTubeStats = {
          totalViews: data.overview.totalViews,
          subscribers: data.overview.subscribers,
          totalVideos: data.overview.totalVideos,
          watchTime: data.overview.watchTime,
          engagementRate: data.overview.engagementRate
        };
        console.log('[useYouTubeData] Formatted stats:', newStats);
        setStats(newStats);

        // Set recent videos if available
        if (Array.isArray(data.recentVideos)) {
          const newRecentVideos = data.recentVideos.map((video: any) => ({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            publishedAt: video.publishedAt,
            stats: {
              views: formatNumber(video.stats?.views),
              likes: formatNumber(video.stats?.likes),
              comments: formatNumber(video.stats?.comments)
            },
            analytics: {
              watchTime: formatWatchTime(video.analytics?.watchTime),
              avgViewDuration: video.analytics?.avgViewDuration,
              engagementRate: video.analytics?.engagementRate ? `${video.analytics.engagementRate}%` : null
            },
            insights: Array.isArray(video.insights) ? video.insights : []
          }));
          console.log('[useYouTubeData] Formatted recent videos:', newRecentVideos);
          setRecentVideos(newRecentVideos);
        }

        setLoading(false);
      } catch (err) {
        console.error('[useYouTubeData] Error fetching YouTube data:', err);
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch YouTube data';
        setError(errorMessage);
        setStats(null);
        setRecentVideos([]);

        // Retry logic for connection errors
        if (errorMessage.includes('Failed to connect to server') && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`[useYouTubeData] Retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount}/${MAX_RETRIES})`);
          retryTimeout = setTimeout(fetchYouTubeData, RETRY_DELAY);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchYouTubeData();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [youtubeToken]);

  const formattedStats: FormattedStats | null = stats ? {
    subscribers: stats.subscribers ? formatNumber(stats.subscribers) : null,
    views: stats.totalViews ? formatNumber(stats.totalViews) : null,
    videos: stats.totalVideos ? formatNumber(stats.totalVideos) : null,
    watchTime: stats.watchTime ? formatWatchTime(stats.watchTime) : null,
    engagement: stats.engagementRate ? `${stats.engagementRate}%` : null
  } : null;

  return { stats: formattedStats, recentVideos, loading, error };
}

function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

function formatWatchTime(minutes: string): string {
  const mins = parseInt(minutes, 10);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return hours.toString() + ' hrs';
  }
  return mins + ' min';
}