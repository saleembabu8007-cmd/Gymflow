import React from 'react';
import { cn } from '../../utils/classNames';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'success' | 'warning' | 'danger' | 'brand';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'auto',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  let activeVariant = variant;
  if (variant === 'auto') {
    if (percentage >= 80) activeVariant = 'success';
    else if (percentage >= 40) activeVariant = 'warning';
    else activeVariant = 'danger';
  }

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const trackClasses = {
    success: 'bg-[var(--color-success-100)]',
    warning: 'bg-[var(--color-warning-100)]',
    danger: 'bg-[var(--color-danger-100)]',
    brand: 'bg-[var(--color-brand-100)]',
    auto: 'bg-neutral-100',
  };

  const fillClasses = {
    success: 'bg-[var(--color-success-500)]',
    warning: 'bg-[var(--color-warning-500)]',
    danger: 'bg-[var(--color-danger-500)]',
    brand: 'bg-[var(--color-brand-500)]',
    auto: 'bg-neutral-900',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1 select-none font-sans', className)}>
      <div className={cn('w-full rounded-full overflow-hidden', trackClasses[activeVariant as keyof typeof trackClasses], sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', fillClasses[activeVariant as keyof typeof fillClasses])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end text-[11px] font-mono font-bold text-neutral-600">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export const ProgressIndicator = ProgressBar;
