import React from 'react';
import { TrendingUp, Users, Clock, BarChart2 } from 'lucide-react';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}

function MetricCard({ title, value, change, icon, isPositive = true }: MetricCardProps) {
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
      <div className="flex items-center justify-between">
        <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
        <span className="text-xs sm:text-sm text-gray-400">Last 30 days</span>
      </div>
    </div>
  );
}

export function ChannelOverview() {
  const { formattedStats, growth } = useYouTubeData();

  const metrics = [
    // Top row
    {
      title: 'Total Views',
      value: formattedStats.views,
      change: growth.views,
      icon: <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />,
      isPositive: !growth.views?.startsWith('-')
    },
    {
      title: 'Subscriber Growth',
      value: formattedStats.subscribers,
      change: growth.subscribers,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />,
      isPositive: !growth.subscribers?.startsWith('-')
    },
    // Bottom row
    {
      title: 'Watch Time',
      value: formattedStats.watchTime,
      change: growth.watchTime,
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />,
      isPositive: !growth.watchTime?.startsWith('-')
    },
    {
      title: 'Engagement Rate',
      value: formattedStats.engagementRate || '0%',
      change: growth.engagementRate || '+0%',
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />,
      isPositive: !growth.engagementRate?.startsWith('-')
    }
  ];

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Channel Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Views */}
        <div className="col-span-1">
          <MetricCard {...metrics[0]} />
        </div>
        {/* Subscriber Growth */}
        <div className="col-span-1">
          <MetricCard {...metrics[1]} />
        </div>
        {/* Watch Time */}
        <div className="col-span-1">
          <MetricCard {...metrics[2]} />
        </div>
        {/* Engagement Rate */}
        <div className="col-span-1">
          <MetricCard {...metrics[3]} />
        </div>
      </div>
    </div>
  );
}