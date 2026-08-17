import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'overlay';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  variant = 'spinner',
  className,
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={cn('w-full space-y-3 animate-pulse', className)}>
        <div className="h-10 bg-neutral-100 rounded-xl w-full" />
        <div className="h-16 bg-neutral-100 rounded-xl w-full" />
        <div className="h-16 bg-neutral-100 rounded-xl w-full" />
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 rounded-2xl',
          className
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin text-neutral-800" />
        {message && <p className="text-xs font-medium text-neutral-600 mt-2">{message}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center text-neutral-500',
        className
      )}
    >
      <Loader2 className="w-7 h-7 animate-spin text-neutral-800 mb-3" />
      <p className="text-sm font-medium text-neutral-600">{message}</p>
    </div>
  );
};
