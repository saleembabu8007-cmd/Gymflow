import React from 'react';
import { Card, CardContent } from './Card';
import { ProgressRing } from './ProgressRing';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number; // percentage
    isPositive: boolean;
  };
  progress?: {
    value: number;
    max?: number;
    variant?: 'auto' | 'success' | 'warning' | 'danger' | 'brand';
    label?: React.ReactNode;
  };
  caption?: string;
  onAction?: () => void;
  actionLabel?: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  progress,
  caption,
  onAction,
  actionLabel = 'View details',
  variant = 'neutral',
  className,
}) => {
  const variantStyles = {
    neutral: 'bg-white border-neutral-200',
    success: 'bg-[var(--color-success-50)] border-[var(--color-success-200)]',
    warning: 'bg-[var(--color-warning-50)] border-[var(--color-warning-200)]',
    danger: 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)]',
  };

  const textColors = {
    neutral: 'text-neutral-900',
    success: 'text-[var(--color-success-900)]',
    warning: 'text-[var(--color-warning-900)]',
    danger: 'text-[var(--color-danger-700)]',
  };

  const iconColors = {
    neutral: 'bg-neutral-100 text-neutral-600',
    success: 'bg-[var(--color-success-100)] text-[var(--color-success-600)]',
    warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]',
    danger: 'bg-[var(--color-danger-100)] text-[var(--color-danger-600)]',
  };

  return (
    <Card className={cn('relative flex flex-col h-full', variantStyles[variant], className)}>
      <CardContent className="p-5 sm:p-6 flex flex-col h-full pt-5 sm:pt-6">
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", iconColors[variant])}>
              {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
            </div>
          )}
          <h3 className="text-[length:var(--text-body-size)] font-bold text-neutral-900 tracking-tight">{title}</h3>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {progress ? (
            <div className="flex justify-center py-2">
              <ProgressRing
                value={progress.value}
                max={progress.max}
                size="lg"
                variant={progress.variant || 'brand'}
                label={progress.label}
                textColor={textColors[variant]}
              />
            </div>
          ) : (
            <div className="flex items-end gap-3 flex-wrap">
              <span className={cn("tabular-nums text-5xl font-bold tracking-tight font-display leading-none", textColors[variant])}>
                {value}
              </span>
              {trend && (
                <span className={cn(
                  "flex items-center gap-0.5 text-[length:var(--text-caption-size)] font-bold mb-1.5 px-2 py-0.5 rounded-[var(--radius-sm)]",
                  trend.isPositive ? "text-[var(--color-success-700)] bg-[var(--color-success-50)]" : "text-[var(--color-danger-700)] bg-[var(--color-danger-50)]"
                )}>
                  {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {trend.value}%
                </span>
              )}
            </div>
          )}
        </div>

        {caption && (
          <p className="text-[length:var(--text-caption-size)] font-medium text-neutral-600 mt-4 leading-relaxed">
            {caption}
          </p>
        )}

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className={cn(
              "mt-4 flex items-center gap-1.5 text-[length:var(--text-caption-size)] font-bold transition-colors group self-start",
              textColors[variant]
            )}
          >
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};
