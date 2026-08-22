import React from 'react';
import { ProgressRing } from './ProgressRing';
import { IconButton } from './IconButton';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface MetricCardProps {
  title: string;
  value?: string | number;
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

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  progress,
  caption,
  onAction,
  actionLabel = 'View details',
  variant = 'brand',
  className,
}) => {
  const variantStyles = {
    brand: 'bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-100/60',
    neutral: 'bg-gradient-to-br from-slate-50 to-slate-100/80 border-slate-200/60',
    success: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100/60',
    warning: 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100/60',
    danger: 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-100/60',
  };

  return (
    <div className={cn('p-6 rounded-[20px] border relative flex flex-col', variantStyles[variant], className)}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        {onAction && (
          <IconButton
            icon={<ArrowRight className="w-4 h-4" />}
            aria-label={actionLabel}
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="-mt-2 -mr-2 bg-white/40 hover:bg-white/60"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center mt-6">
        {progress ? (
          <div className="flex justify-center py-2">
            <ProgressRing
              value={progress.value}
              max={progress.max}
              size="lg"
              variant={progress.variant || 'brand'}
              label={progress.label}
            />
          </div>
        ) : (
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-slate-900 leading-none">
              {value}
            </span>
            {trend && (
              <span className={cn(
                "flex items-center gap-0.5 text-sm font-bold mb-1 px-1.5 py-0.5 rounded-md",
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
        <p className="text-[13.5px] font-medium text-slate-500 mt-4 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
};
