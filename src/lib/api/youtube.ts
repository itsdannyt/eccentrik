import { z } from 'zod';
import axios from 'axios';

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

export async function getVideoDetails(videoId: string) {
  try {
    const response = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'videos',
        part: 'snippet',
        id: videoId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

export async function getChannelIdFromCustomUrl(customUrl: string) {
  try {
    // First try searching for the channel
    const searchResponse = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'search',
        part: 'snippet',
        type: 'channel',
        q: customUrl
      }
    });

    const channels = searchResponse.data.items;
    if (!channels || channels.length === 0) {
      throw new Error('Channel not found');
    }

    // Try getting channel by username
    const channelResponse = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'channels',
        part: 'id',
        forUsername: customUrl
      }
    });

    const channelId = channelResponse.data.items?.[0]?.id;
    if (!channelId) {
      throw new Error('Channel ID not found');
    }

    return channelId;
  } catch (error) {
    console.error('Error getting channel ID:', error);
    throw error;
  }
}

export async function getChannelDetails(channelId: string) {
  try {
    const response = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'channels',
        part: 'snippet,statistics',
        id: channelId
      }
    });

    const channel = response.data.items?.[0];
    if (!channel) {
      throw new Error('Channel not found');
    }

    return channel;
  } catch (error) {
    console.error('Error fetching channel details:', error);
    throw error;
  }
}

export function extractVideoIdFromUrl(url: string): string | null {
  const match = url.match(VIDEO_URL_REGEX);
  return match ? match[1] : null;
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    const response = await getVideoDetails(videoId);

    if (!response) {
      throw new Error('Failed to fetch video metadata');
    }

    const snippet = response.items?.[0]?.snippet;

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

      channelId = await getChannelIdFromCustomUrl(customUrl);
    }

    // Fetch channel details using the channel ID
    const channel = await getChannelDetails(channelId);

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