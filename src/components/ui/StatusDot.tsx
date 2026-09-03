import React from 'react';
import { cn } from '../../utils/classNames';

export type StatusDotVariant =
  | 'paid'
  | 'active'
  | 'dueToday'
  | 'dueSoon'
  | 'overdue'
  | 'expired'
  | 'pending'
  | 'neutral';

export interface StatusDotProps {
  variant?: StatusDotVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
  label?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  className,
  label,
}) => {
  const colorMap: Record<StatusDotVariant, string> = {
    paid: 'bg-[var(--color-success-500)]',
    active: 'bg-[var(--color-success-500)]',
    dueToday: 'bg-[var(--color-warning-500)]',
    dueSoon: 'bg-[var(--color-warning-500)]',
    overdue: 'bg-[var(--color-danger-500)]',
    expired: 'bg-neutral-400',
    pending: 'bg-[var(--color-info-500)]',
    neutral: 'bg-neutral-400',
  };

  const sizeMap = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      className={cn(
        'inline-block rounded-full shrink-0 select-none ring-1 ring-white',
        sizeMap[size],
        colorMap[variant],
        pulse && 'animate-pulse',
        className
      )}
    />
  );
};
