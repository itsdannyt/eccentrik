import React from 'react';
import { ChannelOverview } from './channel/ChannelOverview';
import { VideoPerformance } from './performance/VideoPerformance';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
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

      {/* Channel Overview */}
      {youtubeToken ? (
        <div className="space-y-6 sm:space-y-8">
          <ChannelOverview />
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/dashboard/predictive-insights')}
              className="flex items-center justify-between p-4 bg-gray-950/80 backdrop-blur-sm rounded-xl border border-white/10 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Predictive Insights</h3>
                  <p className="text-sm text-gray-400">AI-powered content optimization</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/trend-pulse')}
              className="flex items-center justify-between p-4 bg-gray-950/80 backdrop-blur-sm rounded-xl border border-white/10 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Trend Pulse</h3>
                  <p className="text-sm text-gray-400">Real-time trending topics</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          Connect your YouTube account to see your channel analytics
        </div>
      )}
    </div>
  );
}