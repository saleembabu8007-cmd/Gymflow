import React from 'react';
import { ProgressRing } from './ProgressRing';
import { IconButton } from './IconButton';
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
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
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
  variant = 'brand',
  className,
}) => {
  const variantStyles = {
    brand: 'bg-teal-50 border-teal-100/60',
    neutral: 'bg-slate-50 border-slate-200/60',
    success: 'bg-emerald-50 border-emerald-100/60',
    warning: 'bg-amber-50 border-amber-100/60',
    danger: 'bg-rose-50 border-rose-100/60',
  };

  const textColors = {
    brand: 'text-teal-900',
    neutral: 'text-slate-900',
    success: 'text-emerald-900',
    warning: 'text-amber-900',
    danger: 'text-rose-700',
  };

  const iconColors = {
    brand: 'bg-teal-100/50 text-teal-600',
    neutral: 'bg-slate-200/50 text-slate-600',
    success: 'bg-emerald-100/50 text-emerald-600',
    warning: 'bg-amber-100/50 text-amber-600',
    danger: 'bg-rose-100/50 text-rose-600',
  };

  return (
    <div className={cn('p-5 sm:p-6 rounded-[20px] border relative flex flex-col h-full', variantStyles[variant], className)}>
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", iconColors[variant] || iconColors.neutral)}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
          </div>
        )}
        <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">{title}</h3>
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
              textColor={textColors[variant] || textColors.neutral}
            />
          </div>
        ) : (
          <div className="flex items-end gap-3 flex-wrap">
            <span className={cn("text-5xl font-bold tracking-tight tabular-nums font-display", textColors[variant])}>
              {value}
            </span>
            {trend && (
              <span className={cn(
                "flex items-center gap-0.5 text-[13px] font-bold mb-1.5 px-2 py-0.5 rounded-md",
                trend.isPositive ? "text-emerald-700 bg-emerald-100/50" : "text-rose-700 bg-rose-100/50"
              )}>
                {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {trend.value}%
              </span>
            )}
          </div>
        )}
      </div>

      {caption && (
        <p className="text-[13px] font-medium text-slate-600 mt-4 leading-relaxed">
          {caption}
        </p>
      )}

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            "mt-4 flex items-center gap-1.5 text-[13px] font-bold transition-colors group self-start",
            textColors[variant]
          )}
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
