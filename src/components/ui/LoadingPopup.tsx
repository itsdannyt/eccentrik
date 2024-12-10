import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingPopupProps {
  isOpen: boolean;
  steps: {
    label: string;
    status: 'pending' | 'loading' | 'complete';
  }[];
}

export function LoadingPopup({ isOpen, steps }: LoadingPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/50 border border-gray-800 rounded-xl p-8 w-full max-w-md">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{step.label}</span>
                  <div className="flex items-center gap-2">
                    {step.status === 'complete' && (
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                    )}
                    {step.status === 'loading' && (
                      <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-4 h-4 bg-gray-700 rounded-full" />
                    )}
                  </div>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      step.status === 'complete' && "bg-green-500 w-full",
                      step.status === 'loading' && "bg-orange-500 animate-progress",
                      step.status === 'pending' && "w-0"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}