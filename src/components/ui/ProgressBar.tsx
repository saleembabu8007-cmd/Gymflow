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
    md: 'h-2.5', // ~10px thick for better visibility
    lg: 'h-4',
  };

  const trackClasses = {
    success: 'bg-emerald-100/60',
    warning: 'bg-amber-100/60',
    danger: 'bg-rose-100/60',
    brand: 'bg-teal-100/60',
    auto: 'bg-slate-100',
  };

  const fillClasses = {
    success: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    danger: 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.4)]',
    brand: 'bg-teal-500 shadow-[0_0_8px_rgba(13,148,136,0.4)]',
    auto: 'bg-slate-500',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      <div className={cn('w-full rounded-full overflow-hidden', trackClasses[activeVariant as keyof typeof trackClasses], sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', fillClasses[activeVariant as keyof typeof fillClasses])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end text-[11px] font-bold tracking-wider text-slate-500">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};
