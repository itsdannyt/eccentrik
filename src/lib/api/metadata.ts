import OpenAI from 'openai';

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

export async function analyzeMetadata(
  description: string,
  tags: string[],
  category: string
): Promise<MetadataAnalysis> {
  try {
    const [metadataAnalysis, trendingTopics] = await Promise.all([
      analyzeWithGPT(description, tags, category),
      fetchTrendingTopics(category),
    ]);

    return {
      ...metadataAnalysis,
      trendingTopics,
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

async function fetchTrendingTopics(category: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=${category}&order=viewCount&maxResults=5&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    return data.items?.map((item: any) => item.snippet?.title || '') || [];
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
}