import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  // Determine color based on value
  const getColorClass = (value: number) => {
    if (value >= 80) return 'from-green-500 to-green-400';
    if (value >= 60) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className={cn('w-full h-2 bg-white/5 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full bg-gradient-to-r transition-all duration-500 ease-out',
          getColorClass(value)
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
