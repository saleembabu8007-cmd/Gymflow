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
  message = "We were unable to load this information. Please check your connection and try again.",
  onRetry,
  retryLabel = 'Try again',
  className,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'p-8 sm:p-12 rounded-[var(--radius-lg)] bg-white border border-neutral-200/80 shadow-2xs text-center flex flex-col items-center justify-center select-none font-sans',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--color-danger-50)] text-[var(--color-danger-600)] flex items-center justify-center mb-3.5 border border-[var(--color-danger-200)] shadow-2xs">
        <AlertCircle className="w-6 h-6 stroke-[2]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight font-display">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
