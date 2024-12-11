import React from 'react';
import { TrendingUp, Users, Clock, BarChart2 } from 'lucide-react';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

interface MetricCardProps {
  title: string;
  value: string | null;
  subtitle: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, subtitle, icon, loading }: MetricCardProps) {
  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-white/5 rounded w-24 mb-2"></div>
            <div className="h-4 bg-white/5 rounded w-20 mb-1"></div>
            <div className="h-3 bg-white/5 rounded w-16"></div>
          </div>
        ) : (
          <>
            <h3 className="text-xl sm:text-2xl font-bold">{value || '—'}</h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{subtitle}</p>
          </>
        )}
      </div>
    </div>
  );
}

export function ChannelOverview() {
  const { stats, loading, error } = useYouTubeData();
  
  console.log('[ChannelOverview] Current stats:', stats);
  console.log('[ChannelOverview] Loading:', loading);
  console.log('[ChannelOverview] Error:', error);

  const metrics = [
    {
      title: "Total Views",
      value: stats?.views,
      subtitle: "Past 30 days",
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />
    },
    {
      title: "Subscriber Growth",
      value: stats?.subscribers,
      subtitle: "Past 30 days",
      icon: <Users className="w-5 h-5 text-green-400" />
    },
    {
      title: "Watch Time",
      value: stats?.watchTime,
      subtitle: "Past 30 days",
      icon: <Clock className="w-5 h-5 text-purple-400" />
    },
    {
      title: "Overall Engagement",
      value: stats?.engagement,
      subtitle: "Past 30 days",
      icon: <BarChart2 className="w-5 h-5 text-orange-400" />
    }
  ];

  if (error) {
    console.error('[ChannelOverview] Rendering error state:', error);
    return (
      <div className="text-red-400 p-4 rounded-lg bg-red-950/50 border border-red-900">
        <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
        <p>{error}</p>
        <p className="text-sm mt-2 text-red-300">Please check your YouTube connection and try again.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Channel Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}