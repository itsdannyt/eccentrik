const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!YOUTUBE_API_KEY) {
  throw new Error('YouTube API key is missing. Please add VITE_YOUTUBE_API_KEY to your .env file')
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  views: string;
  publishedAt: Date;
  duration: string;
}

interface YouTubeApiResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
    statistics: {
      viewCount: string;
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount, 10);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return viewCount;
}

function formatDuration(duration: string): string {
  // Convert ISO 8601 duration to readable format
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] ? parseInt(match[1], 10) : 0);
  const minutes = (match[2] ? parseInt(match[2], 10) : 0);
  const seconds = (match[3] ? parseInt(match[3], 10) : 0);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function fetchTrendingVideos(category: string = ''): Promise<YouTubeVideo[]> {
  try {
    console.log('API Key present:', !!YOUTUBE_API_KEY);
    console.log('Category:', category);
    
    // For development, return mock data if we get a 403
    const handleApiError = (error: any) => {
      console.error('YouTube API error:', error);
      if (error?.status === 403 && process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        return {
          items: [
            {
              id: 'mock1',
              snippet: {
                title: 'Sample Video 1',
                thumbnails: { high: { url: 'https://via.placeholder.com/480x360' } },
                channelTitle: 'Sample Channel',
                publishedAt: new Date().toISOString()
              },
              statistics: { viewCount: '1000000' },
              contentDetails: { duration: 'PT15M33S' }
            },
            {
              id: 'mock2',
              snippet: {
                title: 'Sample Video 2',
                thumbnails: { high: { url: 'https://via.placeholder.com/480x360' } },
                channelTitle: 'Sample Channel',
                publishedAt: new Date().toISOString()
              },
              statistics: { viewCount: '500000' },
              contentDetails: { duration: 'PT8M12S' }
            }
          ]
        };
      }
      throw error;
    };
    
    let url = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=3&key=${YOUTUBE_API_KEY}`;
    
    if (category && category !== 'Overall') {
      // First, search for videos in the category
      const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(category)}&maxResults=3&key=${YOUTUBE_API_KEY}`;
      console.log('Fetching videos for category:', category);
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok) {
        return handleApiError(searchData.error).items;
      }
      
      // Get the video IDs from search results
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      url = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    }

    console.log('Fetching videos from URL:', url.replace(YOUTUBE_API_KEY, 'REDACTED'));
    const response = await fetch(url);
    const data: YouTubeApiResponse = await response.json();

    if (!response.ok) {
      return handleApiError(data.error).items;
    }

    if (!data.items || data.items.length === 0) {
      console.log('No videos found in response:', data);
      return [];
    }

    const videos = data.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      channelName: video.snippet.channelTitle,
      views: formatViewCount(video.statistics.viewCount),
      publishedAt: new Date(video.snippet.publishedAt),
      duration: formatDuration(video.contentDetails.duration)
    }));
    
    console.log('Processed videos:', videos);
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
}
