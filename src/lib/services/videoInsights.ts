import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface VideoInsight {
  title: string;
  description: string;
  thumbnailAnalysis: string;
  keyStrategies: string[];
  engagementFactors: {
    factor: string;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
  }[];
}

export async function analyzeVideo(
  title: string,
  channelName: string,
  views: string,
  publishedAt: Date
): Promise<VideoInsight> {
  try {
    const prompt = `Analyze this YouTube video:
Title: ${title}
Channel: ${channelName}
Views: ${views}
Published: ${publishedAt}

Provide insights about:
1. Title effectiveness
2. Thumbnail suggestions
3. Key success factors
4. Engagement strategies`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a YouTube content analysis expert. Analyze the video data and provide actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = response.choices[0].message.content;
    if (!analysis) throw new Error('No analysis generated');

    // Parse the response into structured insights
    return {
      title: title,
      description: analysis.split('\n\n')[0] || 'No title analysis available',
      thumbnailAnalysis: analysis.split('\n\n')[1] || 'No thumbnail analysis available',
      keyStrategies: [
        'Engaging thumbnail design',
        'Compelling title optimization',
        'Strategic timing',
        'Audience engagement'
      ],
      engagementFactors: [
        {
          factor: 'Title Optimization',
          impact: 'high' as const,
          suggestion: 'Use engaging keywords and clear value proposition'
        },
        {
          factor: 'Thumbnail Design',
          impact: 'high' as const,
          suggestion: 'Create visually striking thumbnails with clear focal points'
        },
        {
          factor: 'Upload Timing',
          impact: 'medium' as const,
          suggestion: 'Schedule uploads during peak audience activity'
        }
      ]
    };
  } catch (error) {
    console.error('Error analyzing video:', error);
    throw error;
  }
}

// Cache insights to reduce API calls
const insightsCache = new Map<string, { insights: VideoInsight; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getVideoInsights(
  videoId: string,
  title: string,
  channelName: string,
  views: string,
  publishedAt: Date
): Promise<VideoInsight> {
  try {
    // Check cache first
    const cached = insightsCache.get(videoId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.insights;
    }

    // For development, return mock insights if OpenAI key is not available
    if (!OPENAI_API_KEY && process.env.NODE_ENV === 'development') {
      console.log('Using mock insights for development');
      const mockInsights: VideoInsight = {
        title: 'Title Analysis',
        description: 'This video uses effective keywords and clear messaging.',
        thumbnailAnalysis: 'The thumbnail is eye-catching and clearly shows the topic.',
        keyStrategies: [
          'Use of trending topics',
          'Clear value proposition',
          'Engaging thumbnail'
        ],
        engagementFactors: [
          {
            factor: 'Title Optimization',
            impact: 'high',
            suggestion: 'The title effectively uses keywords and creates curiosity'
          },
          {
            factor: 'Thumbnail Design',
            impact: 'medium',
            suggestion: 'Consider adding more contrast to make text more readable'
          }
        ]
      };
      
      // Cache the mock insights
      insightsCache.set(videoId, {
        insights: mockInsights,
        timestamp: Date.now()
      });
      
      return mockInsights;
    }

    const insights = await analyzeVideo(title, channelName, views, publishedAt);
    
    // Cache the insights
    insightsCache.set(videoId, {
      insights,
      timestamp: Date.now()
    });
    
    return insights;
  } catch (error) {
    console.error('Error getting video insights:', error);
    throw error;
  }
}
