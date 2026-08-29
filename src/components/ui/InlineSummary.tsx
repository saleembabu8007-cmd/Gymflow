import React from 'react';
import { TwoTierNumber } from './TwoTierNumber';
import { cn } from '../../utils/classNames';

export interface SummaryMetric {
  label: string;
  value: string | number;
  caption?: string;
  trend?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export interface InlineSummaryProps {
  metrics: SummaryMetric[];
  className?: string;
}

export const InlineSummary: React.FC<InlineSummaryProps> = ({ metrics, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 sm:gap-8 flex-wrap py-2 border-b border-neutral-200/60 select-none',
        className
      )}
    >
      {metrics.map((metric, index) => (
        <React.Fragment key={index}>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {metric.label}
            </span>
            <TwoTierNumber
              value={metric.value}
              caption={metric.caption}
              size="sm"
            />
          </div>
          {index < metrics.length - 1 && (
            <span className="hidden sm:inline text-neutral-300 select-none" aria-hidden="true">
              ·
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
