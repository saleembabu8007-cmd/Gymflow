import React from 'react';
import { cn } from '../../utils/classNames';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'ghost',
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
      sm: 'w-7 h-7 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-11 h-11 text-base',
    };

    const variantClasses = {
      primary: 'bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900',
      secondary: 'bg-zinc-100/50 text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200',
      outline: 'bg-transparent border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 active:bg-zinc-100',
      ghost: 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 active:bg-zinc-200/80',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:text-rose-800 active:bg-rose-200',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        title={title || ariaLabel}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded font-medium transition-all duration-150 shrink-0 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
