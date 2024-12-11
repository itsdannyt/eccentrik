import React from 'react';
import { TrendingUp, Users, Clock, BarChart2 } from 'lucide-react';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 h-[140px] flex flex-col justify-between border border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm text-gray-400 whitespace-nowrap">{title}</p>
          <h3 className="text-lg sm:text-2xl font-bold mt-1 whitespace-nowrap">{value}</h3>
        </div>
        <div className="bg-orange-500/10 p-2 rounded-lg flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ChannelOverview() {
  const { stats, loading, error } = useYouTubeData();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading channel analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No analytics data available. Please connect your YouTube account.</p>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Views',
      value: stats.views,
      icon: <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
    },
    {
      title: 'Subscribers',
      value: stats.subscribers,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
    },
    {
      title: 'Watch Time',
      value: stats.watchTime,
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
    },
    {
      title: 'Engagement Rate',
      value: stats.engagement,
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Channel Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </div>
    </div>
  );
}