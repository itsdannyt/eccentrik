import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Eye, ThumbsUp, MessageCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { VideoRecommendations } from './VideoRecommendations';
import { useVideoRecommendations } from '../../../lib/hooks/useVideoRecommendations';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  id: string;
  thumbnail: string;
  title: string;
  views: string;
  likes: string;
  comments: string;
  uploadDate: string;
  trend: 'up' | 'down' | null;
  trendPercentage?: string;
}

export function VideoCard({
  id,
  thumbnail,
  title,
  views,
  likes,
  comments,
  uploadDate,
  trend,
  trendPercentage
}: VideoCardProps) {
  const { recommendations, loading } = useVideoRecommendations(id);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(uploadDate), { addSuffix: true });

  return (
    <div>
      {/* Mobile Layout */}
      <div className="md:hidden bg-gray-950/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover flex flex-col h-full border border-white/10 md:bg-gray-950/80">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video">
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {trend && (
            <div className={cn(
              "absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
              trend === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            )}>
              {trend === 'up' ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {trendPercentage}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col min-w-0">
          <h3 className="font-semibold text-base mb-4 line-clamp-2 flex-shrink-0 min-h-[3rem]">{title}</h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0">
              <Eye className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{views}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0">
              <ThumbsUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{likes}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0">
              <MessageCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{comments}</span>
            </div>
          </div>

          {/* Upload Date */}
          <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 mb-0 min-w-0">
            <span className="text-sm font-medium text-gray-300">{formattedDate}</span>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="mt-0 px-4 pb-4">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-base font-medium text-orange-500">AI Recommendations</span>
            <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform ${showRecommendations ? "rotate-180" : ""}`} />
          </button>

          {/* AI Recommendations Content */}
          {showRecommendations && !loading && recommendations && (
            <div className="mt-2 pt-2 overflow-visible">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar pb-3">
                <VideoRecommendations recommendations={recommendations} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block bg-gray-950/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover flex flex-col h-full border border-white/10 md:bg-gray-950/80">
        {/* Thumbnail Section */}
        <div className="relative w-full aspect-video">
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {trend && (
            <div className={cn(
              "absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
              trend === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            )}>
              {trend === 'up' ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {trendPercentage}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-base mb-4 line-clamp-2 flex-shrink-0 min-h-[3rem]">{title}</h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0 md:bg-gray-900/80">
              <Eye className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{views}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0 md:bg-gray-900/80">
              <ThumbsUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{likes}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0 md:bg-gray-900/80">
              <MessageCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{comments}</span>
            </div>
          </div>

          {/* Upload Date */}
          <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 mb-0 min-w-0 md:bg-gray-900/80">
            <span className="text-sm font-medium text-gray-300">{formattedDate}</span>
          </div>

          {/* AI Recommendations Dropdown */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5 justify-center bg-orange-500/10 hover:bg-orange-500/20 rounded-2xl py-3 px-6 mb-0 min-w-0 transition-colors">
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="w-full flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-orange-500" />
                <span className="text-base font-medium text-orange-500">AI Recommendations</span>
                <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform ${showRecommendations ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* AI Recommendations Content */}
            {showRecommendations && !loading && recommendations && (
              <div className="mt-2">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pb-3">
                  <VideoRecommendations recommendations={recommendations} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}