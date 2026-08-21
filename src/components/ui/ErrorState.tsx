import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/classNames';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Couldn't load this information. Please try again.",
  onRetry,
  retryLabel = 'Try again',
  className,
}) => {
  return (
    <div
      className={cn(
        'p-8 sm:p-12 rounded-2xl bg-white border border-zinc-200 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3.5 border border-rose-100">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">{title}</h3>
      <p className="text-xs font-medium text-zinc-600 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
