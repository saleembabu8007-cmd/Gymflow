import React from 'react';
import { cn } from '../../utils/classNames';

export interface FilterChipOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  badgeVariant?: 'neutral' | 'danger' | 'warning' | 'success';
  icon?: React.ReactNode;
}

export interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function FilterChips<T extends string>({
  options,
  activeId,
  onChange,
  className,
  ariaLabel = 'Filter options',
}: FilterChipsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 select-none', className)}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;

        const badgeColors = {
          neutral: 'bg-neutral-100 text-neutral-700',
          danger: 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)]',
          warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-800)]',
          success: 'bg-[var(--color-success-50)] text-[var(--color-success-800)]',
        };
        const badgeVariant = option.badgeVariant || 'neutral';

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'relative flex items-center justify-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0',
              isActive
                ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-neutral-950 shadow-2xs'
                : 'bg-white border-neutral-200/80 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 shadow-2xs'
            )}
          >
            {option.icon && <span className="mr-0.5">{option.icon}</span>}
            <span>{option.label}</span>

            {option.count !== undefined && (
              <span
                className={cn(
                  'flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold',
                  isActive
                    ? 'bg-neutral-950/15 text-neutral-950'
                    : badgeColors[badgeVariant]
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
