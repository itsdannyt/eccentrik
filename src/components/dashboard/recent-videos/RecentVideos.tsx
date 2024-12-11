import React from 'react';
import { VideoCard } from './VideoCard';
import { Button } from '../../ui/Button';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';
import { Video } from 'lucide-react';

export function RecentVideos() {
  const { recentVideos, loading } = useYouTubeData();
  
  if (import.meta.env.DEV) {
    console.log('RecentVideos state:', {
      recentVideos,
      loading,
      type: recentVideos ? typeof recentVideos : 'undefined',
      isArray: Array.isArray(recentVideos),
      length: Array.isArray(recentVideos) ? recentVideos.length : 'N/A'
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Videos</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-950/80 backdrop-blur-sm rounded-xl overflow-hidden animate-pulse border border-white/10">
              <div className="aspect-video bg-white/5" />
              <div className="p-4 space-y-4">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const videos = Array.isArray(recentVideos) ? recentVideos : [];

  if (videos.length === 0) {
    return (
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
        <Video className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Videos Yet</h3>
        <p className="text-gray-400 mb-4">
          Start uploading videos to see your content performance here
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://studio.youtube.com', '_blank')}
        >
          Go to YouTube Studio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Videos</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://studio.youtube.com/channel/videos', '_blank')}
        >
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            {...video}
          />
        ))}
      </div>
    </div>
  );
}