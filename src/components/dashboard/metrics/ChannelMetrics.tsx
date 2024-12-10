import React from 'react';
import { TrendingUp, Users, Play, ThumbsUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

export function ChannelMetrics() {
  const { formattedStats, growth, loading } = useYouTubeData();

  const metrics = [
    {
      title: 'Total Subscribers',
      value: formattedStats.subscribers,
      change: growth.subscribers,
      trend: growth.subscribers?.startsWith('+') ? 'up' as const : 'down' as const,
      icon: <Users className="w-6 h-6 text-orange-500" />,
      description: 'Last 30 days'
    },
    {
      title: 'Total Views',
      value: formattedStats.views,
      change: growth.views,
      trend: growth.views?.startsWith('+') ? 'up' as const : 'down' as const,
      icon: <Play className="w-6 h-6 text-orange-500" />,
      description: 'Last 7 days'
    },
    {
      title: 'Videos Published',
      value: formattedStats.videos,
      change: growth.videos,
      trend: growth.videos?.startsWith('+') ? 'up' as const : 'down' as const,
      icon: <ThumbsUp className="w-6 h-6 text-orange-500" />,
      description: 'Total videos'
    },
    {
      title: 'Watch Time',
      value: formattedStats.watchTime,
      change: growth.watchTime,
      trend: growth.watchTime?.startsWith('+') ? 'up' as const : 'down' as const,
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      description: 'Hours last 30 days'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard 
          key={index} 
          {...metric} 
          isLoading={loading}
        />
      ))}
    </div>
  );
}