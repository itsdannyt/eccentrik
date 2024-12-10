import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface MetadataAnalysis {
  score: number;
  suggestions: {
    description: string[];
    tags: string[];
    keywords: string[];
  };
  optimizedMetadata: {
    description: string;
    tags: string[];
  };
  trendingTopics: string[];
}

interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

export async function analyzeMetadata(
  description: string,
  tags: string[],
  category: string
): Promise<MetadataAnalysis> {
  try {
    const [metadataAnalysis, trendingTopics] = await Promise.all([
      analyzeWithGPT(description, tags, category),
      fetchPopularVideosInCategory(category),
    ]);

    return {
      ...metadataAnalysis,
      trendingTopics: trendingTopics.map(video => video.title),
    };
  } catch (error) {
    console.error('Error analyzing metadata:', error);
    throw error;
  }
}

async function analyzeWithGPT(
  description: string,
  tags: string[],
  category: string
): Promise<Omit<MetadataAnalysis, 'trendingTopics'>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a YouTube SEO expert. Analyze the provided metadata and suggest improvements.',
      },
      {
        role: 'user',
        content: `Analyze this YouTube video metadata:
          Category: ${category}
          Description: ${description}
          Tags: ${tags.join(', ')}`,
      },
    ],
    temperature: 0.7,
  });

  // In a real implementation, we would parse the GPT response
  // This is a simplified example
  return {
    score: 75,
    suggestions: {
      description: [
        'Add more relevant keywords',
        'Include timestamps for longer videos',
        'Add links to related content',
      ],
      tags: [
        'Use more specific tags',
        'Include trending keywords',
        'Add variations of main keywords',
      ],
      keywords: [
        'Optimize keyword density',
        'Include long-tail keywords',
        'Add relevant hashtags',
      ],
    },
    optimizedMetadata: {
      description: 'Optimized description suggestion...',
      tags: ['suggested', 'tags', 'here'],
    },
  };
}

async function fetchPopularVideosInCategory(category: string): Promise<VideoMetadata[]> {
  try {
    const response = await axios.get('/api/youtube/data', {
      params: {
        endpoint: 'search',
        part: 'snippet',
        type: 'video',
        videoCategoryId: category,
        order: 'viewCount',
        maxResults: 5
      }
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error fetching popular videos:', error);
    throw error;
  }
}