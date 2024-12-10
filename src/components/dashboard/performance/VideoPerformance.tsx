import React from 'react';
import { VideoCard } from './VideoCard';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

export function VideoPerformance() {
  const { recentVideos } = useYouTubeData();

  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Recent Performance</h2>
      
      {/* Show only first 3 videos in desktop view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recentVideos.slice(0, 3).map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            thumbnail={video.thumbnail}
            title={video.title}
            views={video.views}
            likes={video.likes}
            comments={video.comments}
            uploadDate={video.publishedAt}
            trend="up"
            trendPercentage="+15%"
          />
        ))}
      </div>
    </div>
  );
}