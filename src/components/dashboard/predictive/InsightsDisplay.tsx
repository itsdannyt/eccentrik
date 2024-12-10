import React, { useState } from 'react';
import { 
  Sparkles, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { ProgressBar } from '../../ui/ProgressBar';
import { Button } from '../../ui/Button';
import { toast } from 'react-hot-toast';

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

interface InsightsDisplayProps {
  titleInsights: InsightSection;
  thumbnailInsights: InsightSection;
}

export function InsightsDisplay({ 
  titleInsights, 
  thumbnailInsights,
}: InsightsDisplayProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [titleRecommendations, setTitleRecommendations] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  const toggleSuggestion = (id: string) => {
    setExpandedSuggestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    try {
      // Simulate AI title generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example titles based on insights
      const newTitles = [
        "Transform Your Content Strategy: 5 Proven Techniques That Work in 2024",
        "The SECRET to Viral Videos (Based on Real Data) ",
        "How I Doubled My Views Using These Content Optimization Tips "
      ];
      
      setTitleRecommendations(newTitles);
      toast.success('Generated new title recommendations!');
    } catch (error) {
      toast.error('Failed to generate titles. Please try again.');
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const renderSuggestionList = (suggestions: Suggestion[], sectionId: string) => (
    <ul className="space-y-4">
      {suggestions.map((suggestion, index) => {
        const suggestionId = `${sectionId}-${index}`;
        const isExpanded = expandedSuggestions[suggestionId];

        return (
          <li 
            key={suggestionId} 
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{suggestion.text}</p>
                  {(suggestion.examples || suggestion.explanation) && (
                    <button
                      onClick={() => toggleSuggestion(suggestionId)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {suggestion.explanation && (
                      <div className="flex items-start gap-2 text-sm text-gray-400 bg-white/5 p-3 rounded-lg">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>{suggestion.explanation}</p>
                      </div>
                    )}
                    {suggestion.examples && suggestion.examples.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-300">Examples:</p>
                        <ul className="space-y-1">
                          {suggestion.examples.map((example, i) => (
                            <li key={i} className="text-sm text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );

  const renderScoreSection = (
    title: string, 
    insights: InsightSection,
    icon: React.ReactNode
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {insights.benchmarkScore && (
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Benchmark: {insights.benchmarkScore}%
              </span>
            </div>
          )}
          <div className="text-sm font-medium">
            Score: {insights.score}%
          </div>
        </div>
      </div>

      <ProgressBar value={insights.score} />

      {insights.trends && insights.trends.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>Current Trends</span>
          </div>
          <ul className="space-y-2">
            {insights.trends.map((trend, i) => (
              <li key={i} className="text-sm text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500">
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}

      {renderSuggestionList(insights.suggestions, title.toLowerCase())}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Title Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">Title Analysis</h4>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              titleInsights.score >= 80 ? 'bg-green-500/20 text-green-500' :
              titleInsights.score >= 60 ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              Score: {Math.round(titleInsights.score)}
            </span>
          </div>
        </div>

        {renderSuggestionList(titleInsights.suggestions, 'title')}

        {/* Title Recommendations */}
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitles}
            variant="secondary"
            className="w-full"
          >
            {isGeneratingTitles ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating titles...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Titles
              </>
            )}
          </Button>

          {titleRecommendations.length > 0 && (
            <div className="space-y-3 bg-white/5 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300">Recommended Titles:</h5>
              <ul className="space-y-2">
                {titleRecommendations.map((title, index) => (
                  <li 
                    key={index}
                    className="text-sm text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500"
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Benchmark comparison */}
        {titleInsights.benchmarkScore && (
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span>Benchmark Comparison</span>
            </div>
            <p className="text-sm text-gray-400">
              Your title scored {titleInsights.score}% compared to the benchmark score of {titleInsights.benchmarkScore}%.
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">Thumbnail Analysis</h4>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              thumbnailInsights.score >= 80 ? 'bg-green-500/20 text-green-500' :
              thumbnailInsights.score >= 60 ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              Score: {Math.round(thumbnailInsights.score)}
            </span>
          </div>
        </div>

        {renderSuggestionList(thumbnailInsights.suggestions, 'thumbnail')}

        {/* Benchmark comparison */}
        {thumbnailInsights.benchmarkScore && (
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span>Benchmark Comparison</span>
            </div>
            <p className="text-sm text-gray-400">
              Your thumbnail scored {thumbnailInsights.score}% compared to the benchmark score of {thumbnailInsights.benchmarkScore}%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
