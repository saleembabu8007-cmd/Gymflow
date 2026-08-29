import React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { TwoTierNumber } from './TwoTierNumber';
import { cn } from '../../utils/classNames';

export interface EntityHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  badges?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  metrics?: Array<{ label: string; value: string | number; caption?: string }>;
  className?: string;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  title,
  subtitle,
  avatarUrl,
  badges,
  primaryAction,
  secondaryActions,
  metrics,
  className,
}) => {
  return (
    <div className={cn('space-y-4 pb-4 border-b border-neutral-200/80 select-none', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Entity Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar name={title} imageUrl={avatarUrl} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight truncate font-display">
                {title}
              </h1>
              {badges}
            </div>
            {subtitle && <div className="text-xs sm:text-sm text-neutral-500 font-mono mt-0.5">{subtitle}</div>}
          </div>
        </div>

        {/* Action Controls */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2 shrink-0">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>

      {/* Optional Metadata Row */}
      {metrics && metrics.length > 0 && (
        <div className="flex items-center gap-4 sm:gap-6 pt-2 overflow-x-auto">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {metric.label}
              </span>
              <TwoTierNumber value={metric.value} caption={metric.caption} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
