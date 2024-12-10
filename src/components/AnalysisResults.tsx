import React from 'react';
import { BarChart3, Palette, Layout } from 'lucide-react';

interface AnalysisResultsProps {
  titleAnalysis: {
    score: number;
    suggestions: string[];
  };
  thumbnailAnalysis: {
    score: number;
    textReadability: number;
    clutterScore: number;
    detectedObjects: string[];
    colors: {
      dominantColors: string[];
      contrast: number;
      emotionalAppeal: number;
    };
  };
}

export function AnalysisResults({ titleAnalysis, thumbnailAnalysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Title Analysis</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Score:</span>
              <span className="text-2xl font-bold text-blue-600">{titleAnalysis.score}%</span>
            </div>
            <div>
              <h4 className="font-medium mb-2">Suggestions:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {titleAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Layout className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Thumbnail Analysis</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Overall Score:</span>
                <span className="block text-2xl font-bold text-blue-600">{thumbnailAnalysis.score}%</span>
              </div>
              <div>
                <span className="text-gray-600">Readability:</span>
                <span className="block text-2xl font-bold text-blue-600">{thumbnailAnalysis.textReadability}%</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Detected Objects:</h4>
              <div className="flex flex-wrap gap-2">
                {thumbnailAnalysis.detectedObjects.map((object, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {object}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <Palette className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Color Analysis</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Contrast Score:</span>
              <span className="block text-2xl font-bold text-blue-600">{thumbnailAnalysis.colors.contrast}%</span>
            </div>
            <div>
              <span className="text-gray-600">Emotional Appeal:</span>
              <span className="block text-2xl font-bold text-blue-600">{thumbnailAnalysis.colors.emotionalAppeal}%</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Dominant Colors:</h4>
            <div className="flex gap-2">
              {thumbnailAnalysis.colors.dominantColors.map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-lg shadow-inner"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}