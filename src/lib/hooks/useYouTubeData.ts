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

  // Mock data for development
  const mockRecentVideos: RecentVideo[] = [
    {
      id: 'mock1',
      title: 'How to Build a Modern Web App',
      thumbnail: 'https://i.ytimg.com/vi/mock1/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      stats: {
        views: '1.2K',
        likes: '156',
        comments: '23'
      },
      analytics: {
        watchTime: '2.5K',
        avgViewDuration: '4:32',
        engagementRate: '8.5'
      },
      insights: [
        {
          type: 'success',
          message: 'Strong viewer engagement in first 30 seconds'
        },
        {
          type: 'improvement',
          message: 'Consider adding more end cards for retention'
        }
      ]
    },
    {
      id: 'mock2',
      title: 'React Performance Tips & Tricks',
      thumbnail: 'https://i.ytimg.com/vi/mock2/maxresdefault.jpg',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      stats: {
        views: '856',
        likes: '92',
        comments: '15'
      },
      analytics: {
        watchTime: '1.8K',
        avgViewDuration: '5:21',
        engagementRate: '7.2'
      },
      insights: [
        {
          type: 'success',
          message: 'High retention rate throughout video'
        }
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      console.log('fetchData called, token:', youtubeToken ? 'present' : 'absent');
      
      if (!youtubeToken) {
        // Use mock data in development when no token is present
        if (import.meta.env.DEV) {
          console.log('Using mock data in development mode (no token)');
          setStats({
            totalViews: '125.4K',
            subscribers: '12.8K',
            totalVideos: '45',
            watchTime: '458.2K',
            engagementRate: '8.5'
          });
          setRecentVideos(mockRecentVideos);
          return;
        }
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
        console.log('Fetched videos:', videos);
        if (Array.isArray(videos)) {
          setRecentVideos(videos);
        } else {
          console.error('Received non-array videos:', videos);
          if (import.meta.env.DEV) {
            console.log('Using mock videos in development mode (invalid response)');
            setRecentVideos(mockRecentVideos);
          } else {
            setRecentVideos([]);
          }
        }
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        // Use mock data in development when API calls fail
        if (import.meta.env.DEV) {
          console.log('API call failed, using mock data in development mode');
          setStats({
            totalViews: '125.4K',
            subscribers: '12.8K',
            totalVideos: '45',
            watchTime: '458.2K',
            engagementRate: '8.5'
          });
          setRecentVideos(mockRecentVideos);
          return;
        }
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