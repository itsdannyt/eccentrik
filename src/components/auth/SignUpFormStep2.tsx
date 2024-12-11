import React from 'react';
import { Button } from '../ui/Button';
import { ArrowLeft, Youtube } from 'lucide-react';
import { useGoogleAuth } from '../../lib/hooks/useGoogleAuth';

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Connect Your YouTube Channel</h2>
        <p className="text-gray-400 text-sm">
          Connect your YouTube channel to get started with analytics and insights
        </p>
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
  );
}