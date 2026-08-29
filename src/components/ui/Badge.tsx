import React from 'react';
import { cn } from '../../utils/classNames';
import { Check, Clock, Calendar, AlertTriangle } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  treatment?: 'default' | 'emphasis';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  treatment = 'default',
  icon,
  className,
}) => {
  const emphasisClasses = {
    neutral: 'bg-neutral-100 text-neutral-700',
    success: 'bg-[var(--color-success-50)] text-[var(--color-success-700)]',
    warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
    danger: 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)]',
    info: 'bg-[var(--color-info-50)] text-[var(--color-info-700)]',
  };

  const defaultDotClasses = {
    neutral: 'bg-neutral-400',
    success: 'bg-[var(--color-success-500)]',
    warning: 'bg-[var(--color-warning-500)]',
    danger: 'bg-[var(--color-danger-500)]',
    info: 'bg-[var(--color-info-500)]',
  };

  const defaultTextClasses = {
    neutral: 'text-neutral-600',
    success: 'text-neutral-700', // Still neutral text, the dot carries the color
    warning: 'text-neutral-700',
    danger: 'text-neutral-700',
    info: 'text-neutral-700',
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return <Check className="w-3 h-3" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'danger':
        return <Clock className="w-3 h-3" />; // Clock for overdue
      case 'info':
        return <Calendar className="w-3 h-3" />; // Calendar for upcoming
      case 'neutral':
      default:
        return null;
    }
  };

  const activeIcon = icon !== undefined ? icon : getDefaultIcon();

  if (treatment === 'default') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 h-6 text-[12px] font-medium tracking-tight whitespace-nowrap select-none',
          defaultTextClasses[variant],
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", defaultDotClasses[variant])} aria-hidden="true" />
        <span>{children}</span>
      </span>
    );
  }

  // Emphasis treatment
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center h-6 px-2.5 gap-1 rounded-[var(--radius-full)] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap select-none transition-colors font-mono',
        emphasisClasses[variant],
        className
      )}
    >
      {activeIcon && <span className="shrink-0 flex items-center justify-center">{activeIcon}</span>}
      <span>{children}</span>
    </span>
  );
};
