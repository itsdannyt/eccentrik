import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { YouTubeClient } from '../api/youtube/client';
import { CacheService } from '../services/CacheService';

interface YouTubeStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  watchTime: string;
}

interface RecentVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: string;
  likes: string;
  comments: string;
  trend: 'up' | 'down' | null;
  trendPercentage: string;
}

interface FormattedStats {
  subscribers: string;
  views: string;
  videos: string;
  watchTime: string;
}

interface Growth {
  subscribers: string;
  views: string;
  videos: string;
  watchTime: string;
}

export function useYouTubeData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<YouTubeStats>({
    subscriberCount: '0',
    viewCount: '0',
    videoCount: '0',
    watchTime: '0'
  });
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [channelTitle, setChannelTitle] = useState<string>('');
  const [growth, setGrowth] = useState<Growth>({
    subscribers: '0%',
    views: '0%',
    videos: '0',
    watchTime: '0%'
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formattedStats: FormattedStats = {
    subscribers: formatNumber(parseInt(stats.subscriberCount)),
    views: formatNumber(parseInt(stats.viewCount)),
    videos: stats.videoCount,
    watchTime: formatNumber(parseInt(stats.watchTime))
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_metadata?.channel_id) {
        setLoading(false);
        return;
      }

      try {
        const youtubeClient = YouTubeClient.getInstance();
        const cacheService = CacheService.getInstance();
        const channelId = user.user_metadata.channel_id;

        // Try to get data from cache first
        const cacheKey = `youtube_data_${channelId}`;
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          setChannelTitle(cachedData.channelTitle);
          setStats(cachedData.stats);
          setRecentVideos(cachedData.recentVideos);
          setLoading(false);
          return;
        }

        // Fetch channel data
        const channelData = await youtubeClient.getHistoricalData(channelId, user.id);
        
        // Set current channel stats with 30-day metrics
        const thirtyDayMetrics = channelData.statistics.thirtyDayMetrics;
        setStats({
          subscriberCount: (thirtyDayMetrics.subscribersGained - thirtyDayMetrics.subscribersLost).toString(),
          viewCount: thirtyDayMetrics.views.toString(),
          videoCount: channelData.statistics.videoCount || '0',
          watchTime: thirtyDayMetrics.watchTime.toString()
        });
        
        setChannelTitle(channelData.channelTitle);

        // Calculate growth percentages
        const netSubscriberGrowth = thirtyDayMetrics.subscribersGained - thirtyDayMetrics.subscribersLost;
        const previousSubscribers = parseInt(channelData.statistics.subscriberCount) - netSubscriberGrowth;
        
        setGrowth({
          subscribers: `${netSubscriberGrowth > 0 ? '+' : ''}${((netSubscriberGrowth / previousSubscribers) * 100).toFixed(1)}%`,
          views: `+${thirtyDayMetrics.views.toLocaleString()}`,
          videos: channelData.statistics.videoCount,
          watchTime: `${thirtyDayMetrics.watchTime > 0 ? '+' : ''}${formatNumber(thirtyDayMetrics.watchTime)}`
        });

        // Format recent videos data
        const videos = await Promise.all(
          channelData.topPerformingVideos.map(async (video) => {
            const videoStats = await youtubeClient.getVideoStats(video.id, user.id);
            const previousStats = channelData.videoStats[video.id] || {};
            
            return {
              id: video.id,
              title: video.title,
              thumbnail: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
              publishedAt: video.publishedAt,
              views: formatNumber(parseInt(videoStats.viewCount)),
              likes: formatNumber(parseInt(videoStats.likeCount)),
              comments: formatNumber(parseInt(videoStats.commentCount)),
              trend: parseInt(videoStats.viewCount) > parseInt(previousStats.viewCount || '0') ? 'up' : 'down',
              trendPercentage: `${((parseInt(videoStats.viewCount) - parseInt(previousStats.viewCount || '0')) / parseInt(previousStats.viewCount || '0') * 100).toFixed(1)}%`
            };
          })
        );

        setRecentVideos(videos);
        setError(null);

        // Cache the data
        cacheService.set(cacheKey, {
          channelTitle: channelData.channelTitle,
          stats: channelData.statistics,
          recentVideos: videos
        });
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        setError('Failed to fetch channel data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return {
    stats,
    formattedStats,
    growth,
    recentVideos,
    channelTitle,
    loading,
    error
  };
}