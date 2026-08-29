import React from 'react';
import { cn } from '../../utils/classNames';

export interface TwoTierNumberProps {
  value: React.ReactNode;
  caption?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  className?: string;
  valueClassName?: string;
  captionClassName?: string;
  prefix?: React.ReactNode;
}

export const TwoTierNumber: React.FC<TwoTierNumberProps> = ({
  value,
  caption,
  size = 'md',
  layout = 'horizontal',
  align = 'left',
  className,
  valueClassName,
  captionClassName,
  prefix,
}) => {
  const sizeStyles = {
    xs: {
      value: 'text-xs font-bold tabular-nums',
      caption: 'text-[10px] text-neutral-500 font-medium',
      gap: 'gap-1',
    },
    sm: {
      value: 'text-sm font-bold tabular-nums',
      caption: 'text-[11px] text-neutral-500 font-medium',
      gap: 'gap-1.5',
    },
    md: {
      value: 'text-[length:var(--text-body-size)] font-bold tabular-nums tracking-tight',
      caption: 'text-[length:var(--text-caption-size)] text-neutral-500 font-medium',
      gap: 'gap-1.5',
    },
    lg: {
      value: 'text-lg sm:text-xl font-bold tabular-nums tracking-tight',
      caption: 'text-xs sm:text-[length:var(--text-caption-size)] text-neutral-500 font-medium',
      gap: 'gap-1.5',
    },
    xl: {
      value: 'text-2xl sm:text-3xl font-bold tabular-nums tracking-tight',
      caption: 'text-xs text-neutral-500 font-medium',
      gap: 'gap-1',
    },
    '2xl': {
      value: 'text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums tracking-tight font-display',
      caption: 'text-xs text-neutral-500 font-medium',
      gap: 'gap-1',
    },
  };

  const alignStyles = {
    left: 'items-start text-left',
    center: 'items-center text-center justify-center',
    right: 'items-end text-right justify-end',
  };

  const isVertical = layout === 'vertical';

  return (
    <div
      className={cn(
        'inline-flex',
        isVertical ? 'flex-col' : 'flex-row items-baseline',
        sizeStyles[size].gap,
        isVertical && alignStyles[align],
        className
      )}
    >
      <div className="flex items-center gap-0.5 whitespace-nowrap">
        {prefix && <span className="shrink-0">{prefix}</span>}
        <span className={cn(sizeStyles[size].value, 'text-neutral-900 whitespace-nowrap', valueClassName)}>
          {value}
        </span>
      </div>
      {caption && (
        <span className={cn(sizeStyles[size].caption, captionClassName)}>
          {caption}
        </span>
      )}
    </div>
  );
};
