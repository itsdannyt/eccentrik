import React from 'react';
import { Lightbulb, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useChannelInsights } from '../../../lib/hooks/useChannelInsights';
import { cn } from '../../../lib/utils';

export function AIRecommendations() {
  const { insights, loading, error } = useChannelInsights();

  if (loading) {
    return (
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">AI Recommendations</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="p-4 bg-white/5 rounded-lg animate-pulse"
            >
              <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/10 rounded w-full mb-2" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Unable to Load Recommendations</h2>
        </div>
        <p className="text-gray-400">
          We encountered an error while analyzing your channel data. Please try again later.
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">AI Recommendations</h2>
        </div>
        <p className="text-gray-400">
          We need more data to provide meaningful recommendations. Keep creating content, and we'll analyze your performance trends.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">AI Recommendations</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className={cn(
              "p-4 rounded-lg transition-colors",
              insight.priority === 'high' 
                ? 'bg-orange-500/10 hover:bg-orange-500/20' 
                : 'bg-white/5 hover:bg-white/10'
            )}
          >
            <h3 className={cn(
              "font-medium mb-2",
              insight.priority === 'high' && "text-orange-500"
            )}>
              {insight.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3">{insight.description}</p>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "text-sm",
                insight.priority === 'high' 
                  ? "text-orange-500 hover:text-orange-400" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => window.location.href = insight.link}
            >
              {insight.action}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}