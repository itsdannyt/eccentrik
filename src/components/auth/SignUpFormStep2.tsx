import React from 'react';
import { Button } from '../ui/Button';
import { ArrowLeft, Youtube, TrendingUp, BarChart2, Layout, Image } from 'lucide-react';
import { useGoogleAuth } from '../../lib/hooks/useGoogleAuth';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="relative bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 overflow-hidden flex items-start gap-4 border border-white/10">
      {/* Icon Container */}
      <div className="relative flex-shrink-0">
        <div className="bg-gray-900/80 w-12 h-12 rounded-lg flex items-center justify-center border border-white/10">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 min-w-0">
        <h3 className="text-sm font-bold mb-1 text-white">
          {title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

interface SignUpFormStep2Props {
  onBack: () => void;
  onSubmit: (credentials: { accessToken: string; refreshToken?: string; channelId: string }) => Promise<void>;
  isLoading?: boolean;
}

export function SignUpFormStep2({ onBack, onSubmit, isLoading }: SignUpFormStep2Props) {
  const { initiateAuth, isAuthenticating } = useGoogleAuth({
    onSuccess: async (response) => {
      const { access_token, refresh_token } = response;
      try {
        // Set signup flow flag
        sessionStorage.setItem('isSignUpFlow', 'true');

        // Fetch the user's YouTube channel ID
        const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        if (!channelResponse.ok) {
          throw new Error('Failed to fetch YouTube channel');
        }

        const channelData = await channelResponse.json();
        if (!channelData.items?.[0]) {
          throw new Error('No YouTube channel found');
        }

        const channel = channelData.items[0];
        const channelInfo = {
          id: channel.id,
          title: channel.snippet.title,
          url: `https://youtube.com/channel/${channel.id}`,
          statistics: {
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
            viewCount: channel.statistics.viewCount
          }
        };

        // Update signup data with channel info
        const signUpData = JSON.parse(sessionStorage.getItem('signUpData') || '{}');
        signUpData.channelData = channelInfo;
        sessionStorage.setItem('signUpData', JSON.stringify(signUpData));

        await onSubmit({
          accessToken: access_token,
          refreshToken: refresh_token,
          channelId: channel.id
        });
      } catch (error) {
        console.error('Error fetching channel:', error);
        sessionStorage.removeItem('isSignUpFlow');
        throw error;
      }
    }
  });

  const features = [
    {
      icon: <BarChart2 className="w-6 h-6 text-orange-500" />,
      title: "Predictive Title Scoring",
      description: "AI-powered analysis of your video titles to predict click-through rates."
    },
    {
      icon: <Image className="w-6 h-6 text-orange-500" />,
      title: "Thumbnail Analysis",
      description: "AI-driven scoring to ensure your thumbnails capture attention."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      title: "Trend Pulse",
      description: "Real-time insights into trending topics tailored to your niche."
    },
    {
      icon: <Layout className="w-6 h-6 text-orange-500" />,
      title: "Performance Dashboard",
      description: "Track and refine predictions across all your videos."
    }
  ];

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
              disabled={isLoading || isAuthenticating}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>

          <div className="grid gap-4">
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button
              onClick={initiateAuth}
              disabled={isLoading || isAuthenticating}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Youtube className="w-5 h-5 mr-2" />
              {isLoading || isAuthenticating ? 'Connecting...' : 'Connect with YouTube'}
            </Button>
            <p className="text-center text-sm text-gray-400">
              Connect your YouTube channel to get started with AI-powered analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}