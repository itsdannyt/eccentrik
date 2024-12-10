import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export interface YouTubeChannelData {
  id: string;
  title: string;
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}

interface ChannelValidationResult {
  isValid: boolean;
  message: string;
  channelId?: string;
  title?: string;
  description?: string;
  subscriberCount?: string;
  videoCount?: string;
}

function extractCustomUrl(url: string): string | null {
  if (url.includes('/c/')) {
    return url.split('/c/')[1].split('/')[0];
  } else if (url.includes('/@')) {
    return url.split('/@')[1].split('/')[0];
  }
  return null;
}

export async function validateChannelUrl(url: string): Promise<ChannelValidationResult> {
  try {
    const customUrl = extractCustomUrl(url);
    if (!customUrl) {
      return { isValid: false, message: 'Invalid channel URL format' };
    }

    // Search for the channel
    const response = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'search',
        part: 'snippet',
        type: 'channel',
        q: customUrl
      }
    });

    const channel = response.data.items?.[0];
    if (!channel) {
      return { isValid: false, message: 'Channel not found' };
    }

    // Get detailed channel info
    const channelResponse = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'channels',
        part: 'snippet,statistics',
        id: channel.id.channelId
      }
    });

    const channelDetails = channelResponse.data.items?.[0];
    if (!channelDetails) {
      return { isValid: false, message: 'Could not fetch channel details' };
    }

    return {
      isValid: true,
      message: 'Valid channel',
      channelId: channelDetails.id,
      title: channelDetails.snippet.title,
      description: channelDetails.snippet.description,
      subscriberCount: channelDetails.statistics.subscriberCount,
      videoCount: channelDetails.statistics.videoCount
    };
  } catch (error) {
    console.error('Error validating channel:', error);
    return { isValid: false, message: 'Failed to validate channel' };
  }
}

export async function validateAndFetchChannelData(url: string): Promise<YouTubeChannelData> {
  const validation = await validateChannelUrl(url);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  return {
    id: validation.channelId as string,
    title: validation.title as string,
    statistics: {
      viewCount: validation.videoCount as string,
      subscriberCount: validation.subscriberCount as string,
      videoCount: validation.videoCount as string,
    },
  };
}
