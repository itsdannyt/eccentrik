import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink, BarChart2, Users, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';

interface VideoData {
  id: string;
  thumbnail: string;
  title: string;
  views: string;
  ctr: string;
  engagement: string;
  publishedAt: string;
  suggestions: string[];
}

export function PerformanceTable() {
  const [sortBy, setSortBy] = useState<keyof VideoData>('publishedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const videos: VideoData[] = [
    {
      id: '1',
      thumbnail: 'https://i.ytimg.com/vi/example1/mqdefault.jpg',
      title: 'How to Build a React Dashboard',
      views: '12.5K',
      ctr: '8.2%',
      engagement: '15.3%',
      publishedAt: '2024-02-25',
      suggestions: ['Update thumbnail for better CTR', 'Add more engaging title']
    },
    // Add more video data here
  ];

  const handleSort = (column: keyof VideoData) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-6">Video Performance</h2>

      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className={cn(
              "p-4 rounded-lg transition-all cursor-pointer",
              selectedVideo === video.id 
                ? 'bg-white/10 ring-1 ring-orange-500' 
                : 'bg-white/5 hover:bg-white/10'
            )}
            onClick={() => setSelectedVideo(video.id)}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail */}
              <div className="w-full sm:w-48 flex-shrink-0">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-base sm:text-lg line-clamp-2">{video.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://studio.youtube.com/video/${video.id}`, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Views</p>
                      <p className="font-medium">{video.views}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">CTR</p>
                      <p className="font-medium">{video.ctr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Published</p>
                      <p className="font-medium">{new Date(video.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {video.suggestions.map((suggestion, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}