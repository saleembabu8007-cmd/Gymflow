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
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
    };

    const variantClasses = {
      primary: 'bg-teal-600 text-white hover:bg-teal-500 hover:shadow-[0_8px_16px_rgba(13,148,136,0.15)] active:bg-teal-700',
      secondary: 'bg-teal-50 text-teal-700 hover:bg-teal-100 active:bg-teal-200',
      outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
      ghost: 'bg-slate-50 text-slate-600 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
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
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 shrink-0 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-teal-600 focus-visible:outline-offset-2 min-w-[44px] min-h-[44px]',
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
