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

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;

    const fetchData = async () => {
      if (!youtubeToken) {
        setError('No YouTube token available');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/youtube/analytics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${youtubeToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid content type:', contentType);
          throw new Error('Invalid response format');
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch YouTube data');
          setLoading(false);

          if (retryCount < 3) {
            retryCount++;
            retryTimeout = setTimeout(fetchData, 2000 * retryCount);
          }
        }
      }
    };

    fetchData();

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

  return { stats: formattedStats, loading, error };
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