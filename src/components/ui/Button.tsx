import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'ghost' 
  | 'destructive' 
  | 'outline'
  | 'icon'
  | 'inline-action';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium select-none transition-all duration-[var(--duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]',
      md: 'h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]',
      lg: 'h-12 px-6 text-base gap-2.5 rounded-[var(--radius-lg)]',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[var(--color-brand-500)] text-neutral-950 hover:bg-[var(--color-brand-400)] active:bg-[var(--color-brand-600)] shadow-2xs focus-visible:ring-[var(--color-brand-500)] font-semibold',
      secondary:
        'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 shadow-2xs focus-visible:ring-neutral-900',
      outline:
        'bg-transparent border border-neutral-300 text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-neutral-900',
      tertiary:
        'bg-transparent text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-900',
      ghost:
        'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-900',
      destructive:
        'bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-600)] active:bg-[var(--color-danger-700)] shadow-2xs focus-visible:ring-[var(--color-danger-500)] font-semibold',
      icon:
        'w-10 h-10 min-w-[40px] p-0 rounded-full bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-900',
      'inline-action':
        'h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 focus-visible:ring-neutral-900',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variant !== 'icon' && variant !== 'inline-action' && sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center justify-center gap-inherit',
            isLoading && 'opacity-0'
          )}
        >
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {variant !== 'icon' && children && <span className="truncate">{children}</span>}
          {variant === 'icon' && children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-current" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
