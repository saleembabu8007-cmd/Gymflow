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
}

export function FilterChips<T extends string>({
  options,
  activeId,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none", className)}>
      {options.map((option) => {
        const isActive = activeId === option.id;
        
        const badgeColors = {
          neutral: 'bg-neutral-200 text-neutral-700',
          danger: 'bg-danger-100 text-danger-700',
          warning: 'bg-warning-100 text-warning-800',
          success: 'bg-success-100 text-success-800',
        };
        const badgeVariant = option.badgeVariant || 'neutral';
        
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'flex items-center justify-center gap-2 px-4 h-[44px] rounded-full text-[length:var(--text-button-size)] font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              isActive
                ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-[var(--color-brand-foreground)] shadow-[var(--shadow-raised)]'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 shadow-sm'
            )}
          >
            {option.icon && <span className="mr-1">{option.icon}</span>}
            {option.label}
            
            {option.count !== undefined && (
              <span 
                className={cn(
                  "flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold",
                  isActive 
                    ? "bg-black/10 text-current" 
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
