import React, { useState, useRef } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ThumbnailUploader } from '../../ThumbnailUploader';
import { useContentAnalysis } from '../../../lib/hooks/useContentAnalysis';
import { toast } from 'react-hot-toast';
import { InsightsDisplay } from './InsightsDisplay';

interface Suggestion {
  text: string;
  priority: 'high' | 'medium' | 'low';
  examples?: string[];
  explanation?: string;
}

interface InsightSection {
  score: number;
  suggestions: Suggestion[];
  benchmarkScore?: number;
  trends?: string[];
}

export function PredictiveInsights() {
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [insights, setInsights] = useState<{
    title: InsightSection;
    thumbnail: InsightSection;
  }>({
    title: {
      score: 0,
      suggestions: [],
      benchmarkScore: 0,
      trends: []
    },
    thumbnail: {
      score: 0,
      suggestions: [],
      benchmarkScore: 0,
      trends: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [highlightInputs, setHighlightInputs] = useState(false);
  const contentAnalysisRef = useRef<HTMLDivElement>(null);

  const { analyzeContent } = useContentAnalysis();

  const handleThumbnailUpload = (file: File) => {
    setThumbnail(file);
    const url = URL.createObjectURL(file);
    setThumbnailUrl(url);
  };

  const processAnalysisResult = (result: any) => {
    // Process title insights
    const titleInsights: InsightSection = {
      score: result.titleAnalysis?.score || 0,
      suggestions: (result.titleAnalysis?.suggestions || []).map((suggestion: string) => ({
        text: suggestion,
        priority: determinePriority(suggestion),
        explanation: generateExplanation(suggestion),
        examples: generateExamples(suggestion)
      })),
      benchmarkScore: 75, // Example benchmark score
      trends: [
        "Questions in titles seeing 23% more engagement",
        "Numbers and statistics driving higher CTR",
        "Emotional words increasing viewer retention"
      ]
    };

    // Process thumbnail insights
    const thumbnailInsights: InsightSection = {
      score: result.thumbnailAnalysis?.score || 0,
      suggestions: (result.thumbnailAnalysis?.suggestions || []).map((suggestion: string) => ({
        text: suggestion,
        priority: determinePriority(suggestion),
        explanation: generateExplanation(suggestion),
        examples: generateExamples(suggestion)
      })),
      benchmarkScore: 70, // Example benchmark score
      trends: [
        "Bright, high-contrast thumbnails performing well",
        "Face close-ups increasing click-through rates",
        "Text overlay with strong emotional appeal trending"
      ]
    };

    return { titleInsights, thumbnailInsights };
  };

  const determinePriority = (suggestion: string): 'high' | 'medium' | 'low' => {
    // Example logic to determine priority based on keywords
    if (suggestion.toLowerCase().includes('critical') || 
        suggestion.toLowerCase().includes('important') ||
        suggestion.toLowerCase().includes('essential')) {
      return 'high';
    }
    if (suggestion.toLowerCase().includes('consider') || 
        suggestion.toLowerCase().includes('try')) {
      return 'medium';
    }
    return 'low';
  };

  const generateExplanation = (suggestion: string): string => {
    // Example explanations based on suggestion type
    if (suggestion.toLowerCase().includes('emotion')) {
      return 'Emotional content drives 2.5x more engagement. Videos with emotional titles see a 30% increase in click-through rates.';
    }
    if (suggestion.toLowerCase().includes('thumbnail')) {
      return 'Clear, high-contrast thumbnails can increase click-through rates by up to 40%. Focus on creating visually striking images that stand out.';
    }
    return 'Implementing this suggestion could significantly improve your content performance based on current trends and viewer behavior.';
  };

  const generateExamples = (suggestion: string): string[] => {
    // Example implementation - in production, this would be more sophisticated
    if (suggestion.toLowerCase().includes('emotion')) {
      return [
        'Transform Your Channel TODAY!',
        'The Secret to VIRAL Success',
        'Why This Changed Everything...'
      ];
    }
    if (suggestion.toLowerCase().includes('thumbnail')) {
      return [
        'Use bold text with high contrast',
        'Include close-up reactions',
        'Implement the rule of thirds'
      ];
    }
    return [];
  };

  const handleGetInsights = async () => {
    if (!title && !thumbnailUrl) {
      toast.error('Please enter a title or upload a thumbnail');
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      
      // Simulate progress steps
      const simulateProgress = () => {
        setProgress(prev => {
          if (prev < 90) {
            const increment = Math.random() * 15; // Increased from 8 to 15
            const slowdown = Math.max(0.1, 1 - (prev / 100));
            return prev + (increment * slowdown);
          }
          return prev;
        });
      };

      // Start progress simulation
      const progressInterval = setInterval(simulateProgress, 600);

      const result = await analyzeContent(title || null, thumbnailUrl || null);
      if (result.titleAnalysis || result.thumbnailAnalysis) {
        const processedInsights = processAnalysisResult(result);
        setInsights({
          title: processedInsights.titleInsights,
          thumbnail: processedInsights.thumbnailInsights
        });
        // Complete the progress
        clearInterval(progressInterval);
        setProgress(100);
        toast.success('Analysis completed successfully!');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('Error generating insights:', err);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = () => {
    // Implement AI idea generation
    toast.success('Generating new ideas...');
  };

  const handleStartAnalyzing = () => {
    setHighlightInputs(true);
    contentAnalysisRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Remove highlight after 3 seconds
    setTimeout(() => setHighlightInputs(false), 3000);
  };

  const hasInsights = insights.title.suggestions.length > 0 || insights.thumbnail.suggestions.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-white/10">
          {/* Content Analysis Section */}
          <div ref={contentAnalysisRef} className="space-y-6 pb-6 lg:pb-0 lg:pr-6">
              <h3 className="text-lg font-medium mb-4">Content Analysis</h3>
              <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${
                      highlightInputs ? 'border-red-500 ring-1 ring-red-500' : 'border-white/10'
                    }`}
                    placeholder="Enter your video title"
                  />
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Thumbnail
                  </label>
                  <div className={`transition-all duration-300 ${
                    highlightInputs ? 'ring-1 ring-red-500 rounded-lg' : ''
                  }`}>
                    <ThumbnailUploader onImageUpload={handleThumbnailUpload} />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Get Insights Button */}
                <div className="space-y-4">
                  <Button
                    onClick={handleGetInsights}
                    disabled={(!title && !thumbnailUrl) || loading}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Insights
                      </>
                    )}
                  </Button>
                  {loading && (
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-300 ease-out"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400 text-center">
                        {progress < 30 ? 'Initializing analysis...' :
                         progress < 60 ? 'Processing content...' :
                         progress < 90 ? 'Generating insights...' :
                         'Finalizing results...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* AI Insights Section */}
          <div className="space-y-6 pt-8 lg:pt-0 lg:pl-6">
              <h3 className="text-lg font-medium mb-4">AI Insights</h3>
              {hasInsights ? (
                <InsightsDisplay titleInsights={insights.title} thumbnailInsights={insights.thumbnail} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] -mt-8 space-y-4 text-center pb-12 lg:pb-0">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300 font-medium">Ready to optimize your content?</p>
                    <p className="text-gray-400 text-sm">
                      Get AI-powered insights by analyzing your title and thumbnail
                    </p>
                    <div className="flex justify-center">
                      <button 
                        onClick={handleStartAnalyzing}
                        className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition-colors duration-200"
                      >
                        <span>Start analyzing</span>
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}