import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface TrendCard {
  topic: string;
  growth: number;
  category: string;
  status: 'rising' | 'falling';
}

export function TrendAnalysisPage() {
  const trends: TrendCard[] = [
    {
      topic: "AI in Gaming",
      growth: 156,
      category: "Gaming",
      status: "rising"
    },
    {
      topic: "Mobile Game Reviews",
      growth: 89,
      category: "Reviews",
      status: "rising"
    },
    {
      topic: "Streaming Setup Tours",
      growth: -12,
      category: "Tech",
      status: "falling"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trend Analysis</h1>
        <div className="bg-orange-500/10 px-4 py-2 rounded-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <span className="text-orange-500 font-medium">Live Trends</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((trend, index) => (
          <div key={index} className="glass-effect rounded-xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold mb-1">{trend.topic}</h3>
                <span className="text-sm text-gray-400">{trend.category}</span>
              </div>
              <div className={`flex items-center gap-1 ${
                trend.status === 'rising' ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend.status === 'rising' ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="font-medium">{Math.abs(trend.growth)}%</span>
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                style={{ width: `${Math.min(Math.abs(trend.growth), 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}