import React, { useState } from 'react';
import { Bell, Star, Award, TrendingUp, ChevronDown, Activity } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

interface ActivityItem {
  id: string;
  type: 'milestone' | 'subscriber' | 'performance';
  icon: React.ReactNode;
  title: string;
  time: string;
}

export function ActivityFeed() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { stats, recentVideos } = useYouTubeData();

  // Generate activity items based on real data
  const activities: ActivityItem[] = [];

  // Add subscriber milestone if available
  if (parseInt(stats.subscriberCount) > 0) {
    activities.push({
      id: '1',
      type: 'subscriber',
      icon: <Star className="w-5 h-5 text-orange-500" />,
      title: `You have reached ${parseInt(stats.subscriberCount).toLocaleString()} subscribers!`,
      time: 'Current milestone'
    });
  }

  // Add recent video performance
  recentVideos.forEach((video, index) => {
    activities.push({
      id: `video-${index}`,
      type: 'performance',
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
      title: `"${video.title}" has reached ${video.views} views`,
      time: new Date(video.publishedAt).toLocaleDateString()
    });
  });

  // Add view milestone if available
  if (parseInt(stats.viewCount) > 0) {
    activities.push({
      id: 'views',
      type: 'milestone',
      icon: <Award className="w-5 h-5 text-orange-500" />,
      title: `Your channel has reached ${parseInt(stats.viewCount).toLocaleString()} total views!`,
      time: 'Current milestone'
    });
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 h-[400px] flex flex-col items-center justify-center text-center border border-white/10">
        <Activity className="w-8 h-8 text-orange-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Recent Activity</h2>
        <p className="text-gray-400 text-sm">
          Your channel activity will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 h-[400px] flex flex-col border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      <div 
        className={cn(
          "space-y-4 pr-2 flex-1",
          isExpanded ? "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent" : "overflow-hidden",
          !isExpanded && "mask-bottom"
        )}
      >
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="bg-orange-500/10 p-2 rounded-lg">
              {activity.icon}
            </div>
            <div>
              <p className="text-sm mb-1">{activity.title}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      {activities.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          <ChevronDown className={cn(
            "w-4 h-4 ml-1 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </Button>
      )}
    </div>
  );
}