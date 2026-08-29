import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/classNames';

export interface SegmentedControlOption {
  value: string | number;
  label: string;
  count?: number;
  badgeVariant?: 'neutral' | 'danger' | 'warning' | 'success';
}

export interface SegmentedControlProps {
  id?: string;
  label?: string;
  options: SegmentedControlOption[];
  value: string | number;
  onChange: (value: any) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  className,
}) => {
  const [controlId] = React.useState(() => id || `segmented-${Math.random().toString(36).substring(7)}`);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={controlId} className="text-[length:var(--text-caption-size)] font-semibold text-neutral-700 select-none">
          {label}
        </label>
      )}
      
      <div 
        id={controlId}
        className="flex p-1 bg-neutral-100 rounded-[var(--radius-lg)] relative w-full h-10"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          
          const badgeColors = {
            neutral: 'bg-neutral-200 text-neutral-700',
            danger: 'bg-danger-100 text-danger-700',
            warning: 'bg-warning-100 text-warning-800',
            success: 'bg-success-100 text-success-800',
          };
          const badgeVariant = option.badgeVariant || 'neutral';
          
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-1.5 h-full text-[length:var(--text-body-size)] font-semibold rounded-[var(--radius-md)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                "before:absolute before:-inset-y-[6px] before:inset-x-0 before:content-['']",
                isSelected ? "text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${controlId}-indicator`}
                  className="absolute inset-0 bg-white rounded-[var(--radius-md)] shadow-sm pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
              {option.count !== undefined && (
                <span 
                  className={cn(
                    "relative z-10 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold",
                    isSelected 
                      ? "bg-neutral-100 text-neutral-700" 
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
    </div>
  );
};
