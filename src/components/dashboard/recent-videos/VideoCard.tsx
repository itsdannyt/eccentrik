import React from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  likes: string;
  comments: string;
  publishedAt: string;
}

export function VideoCard({ 
  id, 
  title, 
  thumbnail, 
  views, 
  likes, 
  comments, 
  publishedAt 
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
            <p className="text-sm text-gray-400">Views</p>
            <p className="font-medium">{views}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Published</p>
            <p className="font-medium">{formatDate(publishedAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{comments}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewAnalytics}
          >
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}