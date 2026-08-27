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
        'p-8 sm:p-12 rounded-[var(--radius-lg)] bg-white border border-neutral-200 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-danger-50)] text-[var(--color-danger-600)] flex items-center justify-center mb-4 border border-[var(--color-danger-100)]">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-[length:var(--text-heading-size)] font-bold text-neutral-900 tracking-tight">{title}</h3>
      <p className="text-[length:var(--text-body-size)] text-neutral-600 mt-2 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button
            size="md"
            variant="secondary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
