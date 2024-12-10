import React from 'react';
import { Sparkles, Lightbulb, TrendingUp, Target } from 'lucide-react';
import type { VideoInsight } from '../../../lib/services/videoInsights';

interface VideoInsightsProps {
  insights: VideoInsight;
  isLoading: boolean;
}

export function VideoInsights({ insights, isLoading }: VideoInsightsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title Analysis */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-orange-500">
          <Sparkles className="w-3.5 h-3.5" />
          <h3 className="font-medium text-sm">Title Analysis</h3>
        </div>
        <p className="text-xs leading-relaxed text-gray-300">{insights.title}</p>
      </div>

      {/* Thumbnail Analysis */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-orange-500">
          <Target className="w-3.5 h-3.5" />
          <h3 className="font-medium text-sm">Thumbnail Strategy</h3>
        </div>
        <p className="text-xs leading-relaxed text-gray-300">{insights.thumbnailAnalysis}</p>
      </div>

      {/* Key Strategies */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-orange-500">
          <Lightbulb className="w-3.5 h-3.5" />
          <h3 className="font-medium text-sm">Key Strategies</h3>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {insights.keyStrategies.map((strategy, index) => (
            <li key={index} className="flex items-start gap-1.5 text-xs">
              <span className="text-orange-500 mt-0.5">•</span>
              <span className="text-gray-300">{strategy}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Engagement Factors */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-orange-500">
          <TrendingUp className="w-3.5 h-3.5" />
          <h3 className="font-medium text-sm">Engagement Factors</h3>
        </div>
        <div className="grid gap-2">
          {insights.engagementFactors.map((factor, index) => (
            <div
              key={index}
              className="p-2 bg-white/5 rounded-lg space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-200">
                  {factor.factor}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  factor.impact === 'high'
                    ? 'bg-green-500/10 text-green-500'
                    : factor.impact === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-gray-500/10 text-gray-500'
                }`}>
                  {factor.impact} impact
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-400">{factor.suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
