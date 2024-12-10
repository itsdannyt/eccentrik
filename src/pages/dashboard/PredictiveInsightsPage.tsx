import React from 'react';
import { PredictiveInsights } from '../../components/dashboard/predictive/PredictiveInsights';

export function PredictiveInsightsPage() {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="py-6 sm:py-8">
        <h1 className="text-2xl font-bold">Predictive Insights</h1>
      </div>
      <PredictiveInsights />
    </div>
  );
}