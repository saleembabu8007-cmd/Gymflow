import React from 'react';
import { cn } from '../../utils/classNames';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      title,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-10 h-10 text-sm',
      md: 'w-11 h-11 text-base',
      lg: 'w-12 h-12 text-lg',
    };

    const variantClasses = {
      default: 'bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 active:bg-orange-200 active:text-orange-800',
      destructive: 'bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-700 active:bg-rose-200 active:text-rose-800',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        title={title || ariaLabel}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 shrink-0 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2 min-w-[44px] min-h-[44px]',
          sizeClasses[size],
          variantClasses[variant],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
