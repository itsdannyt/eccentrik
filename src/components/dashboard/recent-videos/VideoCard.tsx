import React from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  stats: {
    views: string;
    likes: string;
    comments: string;
  };
  analytics: {
    watchTime: string;
    avgViewDuration: string;
    engagementRate: string;
  };
  insights: Array<{
    type: 'improvement' | 'success';
    message: string;
  }>;
}

export function VideoCard({ 
  id, 
  title, 
  thumbnail, 
  publishedAt,
  stats,
  analytics,
  insights 
}: VideoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewAnalytics = () => {
    window.open(`https://studio.youtube.com/video/${id}/analytics`, '_blank');
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden card-hover">
      <div className="relative aspect-video">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium mb-3 line-clamp-2">{title}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <ThumbsUp className="w-4 h-4" />
              {stats.likes}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MessageCircle className="w-4 h-4" />
              {stats.comments}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">
              {stats.views} views
            </p>
            <p className="text-sm text-gray-400">
              {formatDate(publishedAt)}
            </p>
          </div>
        </div>

        {insights && insights.length > 0 && (
          <div className="mt-3 space-y-2">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`text-xs p-2 rounded ${
                  insight.type === 'success' 
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-orange-500/10 text-orange-400'
                }`}
              >
                {insight.message}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleViewAnalytics}
          >
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}