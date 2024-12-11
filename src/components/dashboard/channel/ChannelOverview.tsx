import React from 'react';
import { TrendingUp, Users, Clock, BarChart2 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function ChannelOverview() {
  // Placeholder metrics
  const metrics = [
    {
      title: "Total Views",
      value: "124.5K",
      subtitle: "Past 30 days",
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />
    },
    {
      title: "Subscriber Growth",
      value: "+2,847",
      subtitle: "Past 30 days",
      icon: <Users className="w-5 h-5 text-green-400" />
    },
    {
      title: "Watch Time",
      value: "8.2K hrs",
      subtitle: "Past 30 days",
      icon: <Clock className="w-5 h-5 text-purple-400" />
    },
    {
      title: "Overall Engagement",
      value: "9.4%",
      subtitle: "Past 30 days",
      icon: <BarChart2 className="w-5 h-5 text-orange-400" />
    }
  ];

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
          />
        ))}
      </div>
    </div>
  );
}