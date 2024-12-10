import React from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | null;
  change: string | null;
  trend: 'up' | 'down' | null;
  icon: React.ReactNode;
  description: string;
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  description,
  isLoading 
}: MetricCardProps) {
  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 card-hover border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          {isLoading ? (
            <div className="flex items-center gap-2 mt-1">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : value ? (
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          ) : (
            <p className="text-lg text-gray-500 mt-1">No data available</p>
          )}
        </div>
        <div className="bg-orange-500/10 p-3 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {isLoading ? (
          <div className="h-5" /> // Placeholder for loading state
        ) : change && trend ? (
          <div className="flex items-center">
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={cn(
              'text-sm font-medium',
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {change}
            </span>
          </div>
        ) : (
          <div className="h-5" /> // Placeholder for empty state
        )}
        <span className="text-sm text-gray-400">{description}</span>
      </div>
    </div>
  );
}