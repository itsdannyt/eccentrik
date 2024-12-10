import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { validateAndFetchChannelData } from '../../lib/api/youtube';
import { ArrowLeft, Info } from 'lucide-react';

const signUpStep2Schema = z.object({
  youtubeChannel: z.string().min(1, 'YouTube channel URL is required'),
});

type SignUpStep2Data = z.infer<typeof signUpStep2Schema>;

interface SignUpFormStep2Props {
  onBack: () => void;
  onSubmit: (channelUrl: string) => Promise<void>;
  isLoading?: boolean;
}

export function SignUpFormStep2({ onBack, onSubmit, isLoading }: SignUpFormStep2Props) {
  const [isValidating, setIsValidating] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<SignUpStep2Data>({
    resolver: zodResolver(signUpStep2Schema),
  });

  const handleFormSubmit = async (data: SignUpStep2Data) => {
    setIsValidating(true);
    try {
      await validateAndFetchChannelData(data.youtubeChannel);
      await onSubmit(data.youtubeChannel);
    } catch (error) {
      setError('youtubeChannel', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to validate channel',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="youtubeChannel" className="block text-sm font-medium text-gray-300 mb-1">
          YouTube Channel URL
        </label>
        <input
          {...register('youtubeChannel')}
          type="text"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="https://youtube.com/channel/UC..."
        />
        {errors.youtubeChannel && (
          <p className="mt-1 text-sm text-red-500">{errors.youtubeChannel.message}</p>
        )}
        
        <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-2">How to find your channel URL:</p>
              <ol className="space-y-2 text-gray-400 ml-4">
                <li>1. Go to YouTube Studio (studio.youtube.com)</li>
                <li>2. Click "Customization" in the left menu</li>
                <li>3. Under "Channel URL", copy your channel URL</li>
              </ol>
              <p className="mt-3 text-xs text-gray-500">
                We support channel URLs in these formats:
                <br />• youtube.com/channel/UC...
                <br />• youtube.com/@username
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isValidating}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400/80"
        >
          {isLoading || isValidating ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}