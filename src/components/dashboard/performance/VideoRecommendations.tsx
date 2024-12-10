import React from 'react';
import { cn } from '../../../lib/utils';

interface Recommendation {
  type: 'thumbnail' | 'title' | 'timing' | 'engagement';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

interface VideoRecommendationsProps {
  recommendations: Recommendation[];
}

export function VideoRecommendations({ recommendations }: VideoRecommendationsProps) {
  return (
    <div className="space-y-2 px-4">
      {recommendations.map((rec, index) => (
        <div
          key={index}
          className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors -mx-4 px-4"
        >
          <div className={cn(
            "px-1.5 py-0.5 text-xs rounded font-medium",
            rec.impact === 'high' && "bg-orange-500/20 text-orange-500",
            rec.impact === 'medium' && "bg-yellow-500/20 text-yellow-500",
            rec.impact === 'low' && "bg-blue-500/20 text-blue-500"
          )}>
            {rec.impact}
          </div>
          <p className="text-sm text-gray-300 flex-1">
            {rec.suggestion}
          </p>
        </div>
      ))}
    </div>
  );
}