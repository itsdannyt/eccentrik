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

export async function validateAndFetchChannelData(url: string): Promise<YouTubeChannelData> {
  try {
    // Extract channel ID from URL
    let channelId = '';
    const urlObj = new URL(url);
    
    if (url.includes('/channel/')) {
      channelId = url.split('/channel/')[1].split('/')[0];
    } else if (url.includes('/c/') || url.includes('/@')) {
      // For custom URLs, we need to first get the channel ID
      const customUrl = url.includes('/c/') 
        ? url.split('/c/')[1].split('/')[0]
        : url.split('/@')[1].split('/')[0];
        
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${customUrl}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.data?.items?.length) {
        throw new Error('Channel not found');
      }
      
      channelId = response.data.items[0].id.channelId;
    } else {
      throw new Error('Invalid YouTube channel URL format');
    }

    // Get channel details
    const channelResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.data?.items?.length) {
      throw new Error('Channel not found');
    }

    const channel = channelResponse.data.items[0];
    
    return {
      id: channelId,
      title: channel.snippet.title,
      statistics: {
        viewCount: channel.statistics.viewCount,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Channel not found');
      } else if (error.response?.status === 403) {
        throw new Error('YouTube API quota exceeded. Please try again later.');
      }
    }
    throw error;
  }
}
