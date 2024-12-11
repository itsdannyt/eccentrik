import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';
import { signUp } from '../../lib/auth';
import { validateAndFetchChannelData, type YouTubeChannelData } from '../../lib/api/youtube/validate';
import { YouTubeOAuth } from '../../lib/api/youtube/oauth';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  youtubeChannel: z.string().url('Must be a valid URL').min(1, 'YouTube channel URL is required'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const navigate = useNavigate();
  const [isValidatingChannel, setIsValidatingChannel] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const validateChannel = async (url: string): Promise<YouTubeChannelData | null> => {
    setIsValidatingChannel(true);
    try {
      console.log('Validating channel URL:', url);
      const channelData = await validateAndFetchChannelData(url);
      console.log('Channel validation successful:', channelData);
      return channelData;
    } catch (error) {
      console.error('Channel validation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to validate YouTube channel';
      setError('youtubeChannel', {
        type: 'manual',
        message,
      });
      toast.error(`YouTube channel error: ${message}`);
      return null;
    } finally {
      setIsValidatingChannel(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Validate YouTube channel
      console.log('Starting sign-up process...');
      console.log('Validating YouTube channel:', data.youtubeChannel);
      const channelData = await validateChannel(data.youtubeChannel);
      if (!channelData) {
        console.error('Channel validation failed');
        return;
      }

      // Store form data and channel data in sessionStorage
      sessionStorage.setItem('signUpData', JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        channelData: {
          url: data.youtubeChannel,
          id: channelData.id,
          title: channelData.title,
          statistics: channelData.statistics,
        }
      }));

      // Initiate YouTube OAuth first
      console.log('Channel validated, proceeding to YouTube OAuth');
      const youtubeOAuth = new YouTubeOAuth();
      const authUrl = youtubeOAuth.getAuthUrl();
      
      // Store a flag to indicate we're in signup flow
      sessionStorage.setItem('isSignUpFlow', 'true');
      
      // Redirect to YouTube OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Sign-up error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create account. Please try again.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
          Full Name
        </label>
        <input
          {...register('fullName')}
          type="text"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="John Doe"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="youtubeChannel" className="block text-sm font-medium text-gray-300 mb-1">
          YouTube Channel URL
        </label>
        <input
          {...register('youtubeChannel')}
          type="text"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="https://youtube.com/@yourchannel"
        />
        {errors.youtubeChannel && (
          <p className="mt-1 text-sm text-red-500">{errors.youtubeChannel.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          Don't have a channel?{' '}
          <a
            href="https://www.youtube.com/create_channel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400"
          >
            Create one here
          </a>
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isValidatingChannel}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-400/80"
      >
        {isSubmitting || isValidatingChannel ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-500 hover:text-orange-400">
          Log in
        </Link>
      </p>
    </form>
  );
}