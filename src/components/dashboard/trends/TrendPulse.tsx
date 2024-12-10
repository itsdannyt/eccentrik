import React, { useState, useEffect } from 'react';
import { TrendingUp, Play, ExternalLink, ChevronDown, ChevronUp, Sparkles, Eye, Clock, User2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CategorySearch } from './CategorySearch';
import { formatDistanceToNow } from 'date-fns';
import { fetchTrendingVideos, type YouTubeVideo } from '../../../lib/services/youtube';
import { getVideoInsights, type VideoInsight } from '../../../lib/services/videoInsights';
import { VideoInsights } from './VideoInsights';
import { toast } from 'react-hot-toast';

interface VideoWithInsights extends YouTubeVideo {
  insights?: VideoInsight;
  isLoadingInsights?: boolean;
}

export function TrendPulse() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Overall');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingVideos, setTrendingVideos] = useState<VideoWithInsights[]>([]);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const handleFetchVideos = async (category: string = 'Overall') => {
    setIsLoading(true);
    try {
      const videos = await fetchTrendingVideos(category);
      setTrendingVideos(videos.map(video => ({ ...video })));
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      toast.error('Failed to load trending videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchVideos();
  }, []);

  const handleLoadInsights = async (video: VideoWithInsights) => {
    if (video.insights) {
      return;
    }

    const videoIndex = trendingVideos.findIndex(v => v.id === video.id);
    if (videoIndex === -1) return;

    setTrendingVideos(prev => {
      const updated = [...prev];
      updated[videoIndex] = { ...video, isLoadingInsights: true };
      return updated;
    });

    try {
      const insights = await getVideoInsights(
        video.id,
        video.title,
        video.channelName,
        video.views,
        video.publishedAt
      );

      setTrendingVideos(prev => {
        const updated = [...prev];
        updated[videoIndex] = {
          ...video,
          insights,
          isLoadingInsights: false
        };
        return updated;
      });
    } catch (error) {
      console.error('Error loading insights:', error);
      toast.error('Failed to load video insights. Please try again.');
      setTrendingVideos(prev => {
        const updated = [...prev];
        updated[videoIndex] = { ...video, isLoadingInsights: false };
        return updated;
      });
    }
  };

  const handleExpandVideo = async (videoId: string) => {
    if (expandedVideo === videoId) {
      setExpandedVideo(null);
      return;
    }

    setExpandedVideo(videoId);
    const video = trendingVideos.find(v => v.id === videoId);
    if (video && !video.insights && !video.isLoadingInsights) {
      handleLoadInsights(video);
    }
  };

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <CategorySearch onSearch={handleFetchVideos} isLoading={isLoading} />
      
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-semibold">
              {selectedCategory === 'Overall' 
                ? 'Top Trending on YouTube' 
                : `Trending in ${selectedCategory}`}
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingVideos.slice(0, 10).map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-950/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover flex flex-col h-full border border-white/10 md:bg-gray-950/80"
                >
                  {/* Thumbnail Section */}
                  <div className="relative w-full pt-[56.25%]">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-semibold text-base mb-4 line-clamp-2 flex-shrink-0 min-h-[3rem]">
                      {video.title}
                    </h3>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0 md:bg-gray-900/80">
                        <Eye className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{video.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0 md:bg-gray-900/80">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{video.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 min-w-0 md:bg-gray-900/80">
                        <User2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{video.channelName}</span>
                      </div>
                    </div>

                    {/* Channel and Published Date */}
                    <div className="flex items-center gap-1.5 justify-center bg-gray-900/80 rounded-lg py-2 px-3 mb-4 min-w-0 md:bg-gray-900/80">
                      <span className="text-sm font-medium text-gray-300">
                        Published {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        onClick={() => handleVideoClick(video.id)}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="outline"
                      >
                        <Play className="w-4 h-4" />
                        <span>Watch</span>
                      </Button>
                      <Button
                        onClick={() => handleExpandVideo(video.id)}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="outline"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Insights</span>
                      </Button>
                    </div>

                    {/* Expanded Insights */}
                    {expandedVideo === video.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <VideoInsights
                          insights={video.insights}
                          isLoading={video.isLoadingInsights}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}