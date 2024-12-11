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
    <div className="group relative bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 card-hover overflow-hidden flex items-start gap-4 border border-white/10">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon Container */}
      <div className="relative flex-shrink-0">
        <div className="bg-gray-900/80 w-12 h-12 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-gray-800/80 border border-white/10">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 min-w-0">
        <h3 className="text-sm font-bold mb-1 group-hover:text-orange-500 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hover Line Effect */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </div>
  );
}

interface SignUpFormStep2Props {
  onBack: () => void;
  onSubmit: (credentials: { accessToken: string; channelId: string }) => Promise<void>;
  isLoading?: boolean;
}

export function SignUpFormStep2({ onBack, onSubmit, isLoading }: SignUpFormStep2Props) {
  const { initiateAuth, isAuthenticating } = useGoogleAuth({
    onSuccess: async (response) => {
      const { access_token } = response;
      try {
        // Fetch the user's YouTube channel ID
        const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        if (!channelResponse.ok) {
          throw new Error('Failed to fetch YouTube channel');
        }

        const channelData = await channelResponse.json();
        if (!channelData.items?.[0]?.id) {
          throw new Error('No YouTube channel found');
        }

        await onSubmit({
          accessToken: access_token,
          channelId: channelData.items[0].id
        });
      } catch (error) {
        console.error('Error fetching channel:', error);
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
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
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
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <Youtube className="w-5 h-5" />
            <span>Connect with YouTube</span>
          </Button>

          <button
            type="button"
            onClick={onBack}
            disabled={isLoading || isAuthenticating}
            className="w-full flex items-center justify-center space-x-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="text-sm text-gray-500">
          <p>By connecting your channel, you agree to our terms of service and privacy policy.</p>
        </div>
      </div>
    </div>
  );
}