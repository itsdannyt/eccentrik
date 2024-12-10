import React from 'react';
import { TrendPulse } from '../../components/dashboard/trends/TrendPulse';

export function TrendPulsePage() {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="py-6 sm:py-8">
        <h1 className="text-2xl font-bold">Trend Pulse</h1>
      </div>
      <TrendPulse />
    </div>
  );
}