import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ size = 'md', className, 'aria-label': ariaLabel = 'Close', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
    };

    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 shrink-0 select-none cursor-pointer',
          // Minimum 44px touch target expansion for mobile
          'before:absolute before:-inset-2 before:content-[\'\'] before:pointer-events-auto sm:before:hidden',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <X className={cn('stroke-[2]', iconSizes[size])} />
      </button>
    );
  }
);

CloseButton.displayName = 'CloseButton';
