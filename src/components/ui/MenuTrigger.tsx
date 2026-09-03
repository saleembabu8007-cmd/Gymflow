import React from 'react';
import { MoreVertical, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface MenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  (
    {
      orientation = 'horizontal',
      size = 'md',
      'aria-label': ariaLabel = 'More options',
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
    };

    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const Icon = orientation === 'vertical' ? MoreVertical : MoreHorizontal;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 shrink-0 select-none cursor-pointer',
          // 44px touch target padding
          'before:absolute before:-inset-2 before:content-[\'\'] before:pointer-events-auto sm:before:hidden',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Icon className={cn('stroke-[2]', iconSizes[size])} />
      </button>
    );
  }
);

MenuTrigger.displayName = 'MenuTrigger';
