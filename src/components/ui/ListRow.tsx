import React from 'react';
import { cn } from '../../utils/classNames';
import { TwoTierNumber } from './TwoTierNumber';

export interface ListRowProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  value?: React.ReactNode;
  valueSubtitle?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  highlighted?: boolean;
  className?: string;
  isOverdue?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  leading,
  title,
  subtitle,
  status,
  value,
  valueSubtitle,
  actions,
  onClick,
  highlighted,
  className,
  isOverdue,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 min-h-[64px] transition-colors bg-white',
        onClick && 'cursor-pointer hover:bg-neutral-50/80',
        highlighted && 'bg-[var(--color-success-50)]',
        isOverdue && !highlighted && 'border-l-4 border-l-[var(--color-danger-500)] bg-[var(--color-danger-50)]/40',
        className
      )}
    >
      {/* Leading Avatar + Name + Subtitle + Metadata Column (Flex 1) */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-[length:var(--text-body-size)] text-neutral-900 truncate">
              {title}
            </div>
            {/* Inline metadata pills (≤2 items) */}
            {status && (
              <div className="shrink-0 flex items-center gap-1.5">
                {status}
              </div>
            )}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-[length:var(--text-caption-size)] text-neutral-500 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Trailing Value + Primary Pill Action + Overflow */}
      <div className="flex items-center justify-between sm:justify-end mt-3 sm:mt-0 ml-[52px] sm:ml-0 gap-4 sm:gap-5 shrink-0">
        {/* Trailing Two-Tier Number Value */}
        {(value || valueSubtitle) && (
          <TwoTierNumber
            value={value}
            caption={valueSubtitle}
            layout="vertical"
            align="right"
            size="md"
            className="w-auto sm:w-28 shrink-0"
            captionClassName="text-[11px] font-medium text-neutral-500 mt-0.5"
          />
        )}

        {/* Action Column: Exactly ONE Primary Pill Action + Overflow */}
        {actions && (
          <div className="flex items-center justify-end shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
