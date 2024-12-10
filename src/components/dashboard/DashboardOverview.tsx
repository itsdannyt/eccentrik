import React from 'react';
import { ChannelOverview } from './channel/ChannelOverview';
import { VideoPerformance } from './performance/VideoPerformance';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';

export function DashboardOverview() {
  const { user } = useAuth();
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
      </div>

      {/* Channel Overview */}
      <div className="space-y-6 sm:space-y-8">
        <ChannelOverview />
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/dashboard/predictive-insights')}
            className="flex items-center justify-between p-6 rounded-xl bg-gray-950/80 hover:bg-gray-900/80 transition-all border border-white/10 backdrop-blur-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-1">Predictive Insights</h3>
                <p className="text-sm text-gray-400">Get AI-powered predictions for your content</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/trend-pulse')}
            className="flex items-center justify-between p-6 rounded-xl bg-gray-950/80 hover:bg-gray-900/80 transition-all border border-white/10 backdrop-blur-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-1">Trend Pulse</h3>
                <p className="text-sm text-gray-400">Discover trending topics and insights</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Video Performance */}
        <VideoPerformance />
      </div>
    </div>
  );
}