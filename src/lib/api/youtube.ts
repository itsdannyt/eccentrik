import { z } from 'zod';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
}

// Support multiple URL formats
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{22}|c\/[\w-]+|@[\w-]+)\/?$/;
const VIDEO_URL_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;

export function extractVideoIdFromUrl(url: string): string | null {
  const match = url.match(VIDEO_URL_REGEX);
  return match ? match[1] : null;
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video metadata');
    }

    const data = await response.json();
    const snippet = data.items?.[0]?.snippet;

    if (!snippet) {
      return null;
    }

    return {
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags || [],
      categoryId: snippet.categoryId,
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    throw error;
  }
}

export async function validateAndFetchChannelData(url: string): Promise<YouTubeChannelData> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured');
  }

  if (!YOUTUBE_URL_REGEX.test(url)) {
    throw new Error('Please provide a valid YouTube channel URL (e.g., https://youtube.com/channel/UC...)');
  }

  try {
    // First try direct channel ID if provided
    let channelId = url.match(/channel\/UC[\w-]{22}/)?.[0].replace('channel/', '');
    
    // If not a direct channel ID URL, try to fetch channel ID from custom URL
    if (!channelId) {
      const customUrl = url.split('/').pop()?.replace('@', '');
      if (!customUrl) {
        throw new Error('Invalid channel URL format');
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${customUrl}&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to resolve channel URL');
      }

      const data = await response.json();
      channelId = data.items?.[0]?.id;

      if (!channelId) {
        throw new Error('Channel not found');
      }
    }

    // Fetch channel details using the channel ID
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('YouTube API Error:', error);
      throw new Error(error.error?.message || 'Failed to fetch channel data');
    }

    const data = await response.json();
    
    if (!data.items?.length) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      statistics: {
        viewCount: channel.statistics.viewCount,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
      },
      thumbnails: channel.snippet.thumbnails,
    };
  } catch (error) {
    console.error('Error validating channel:', error);
    throw error;
  }
}

export const youtubeChannelSchema = z.string()
  .refine(
    (url) => YOUTUBE_URL_REGEX.test(url),
    "Please provide a valid YouTube channel URL (e.g., https://youtube.com/channel/UC...)"
  );