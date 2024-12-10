import React from 'react';
import { useAuth } from '../../../lib/auth/AuthProvider';
import { useYouTubeData } from '../../../lib/hooks/useYouTubeData';

export function WelcomeMessage() {
  const { user } = useAuth();
  const { channelTitle } = useYouTubeData();
  const fullName = user?.user_metadata?.full_name || 'there';
  const firstName = fullName.split(' ')[0];

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome back, {firstName}! 👋
      </h1>
      <p className="text-gray-400">
        Here's how your channel is performing
      </p>
    </div>
  );
}