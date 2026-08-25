import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'destructive-ghost';
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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] active:shadow-none min-h-[44px] text-[14px]';

    const sizeStyles = {
      sm: 'px-4 py-2 gap-1.5',
      md: 'px-5 py-2 gap-2',
      lg: 'text-[16px] px-6 py-3 gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus-visible:ring-orange-500 shadow-sm hover:shadow-md',
      secondary:
        'bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300 focus-visible:ring-orange-500',
      tertiary:
        'bg-transparent text-orange-700 hover:bg-orange-50 active:bg-orange-100 focus-visible:ring-orange-500',
      destructive:
        'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 focus-visible:ring-rose-500 shadow-sm hover:shadow-md',
      'destructive-ghost':
        'bg-transparent text-rose-700 hover:bg-rose-50 active:bg-rose-100 focus-visible:ring-rose-500',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
