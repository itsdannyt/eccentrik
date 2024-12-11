import React from 'react';
import { ChannelOverview } from './channel/ChannelOverview';
import { RecentVideos } from './recent-videos/RecentVideos';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { YouTubeConnect } from '../auth/YouTubeConnect';

export function DashboardOverview() {
  const { user, youtubeToken } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Welcome Message */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Here's how your channel is performing
        </p>
        {!youtubeToken && (
          <div className="mt-4">
            <YouTubeConnect />
          </div>
        )}
      </div>

      {youtubeToken && (
        <div className="space-y-8">
          {/* Channel Overview */}
          <ChannelOverview />

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/dashboard/predictive-insights')}
              className="w-full p-6 bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Predictive Insights</h3>
                <p className="text-sm text-gray-400">
                  Get AI-powered recommendations for your content strategy
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate('/dashboard/trend-pulse')}
              className="w-full p-6 bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Trend Pulse</h3>
                <p className="text-sm text-gray-400">
                  Stay ahead with real-time trending topics and ideas
                </p>
              </div>
            </button>
          </div>

          {/* Recent Performance */}
          <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Recent Performance</h2>
            <RecentVideos />
          </div>
        </div>
      )}
    </div>
  );
}