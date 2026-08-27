import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

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
      'inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-all duration-[var(--duration-micro)] ease-[var(--ease-swift)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] active:shadow-none min-h-[44px] text-[length:var(--text-button-size)] leading-[var(--text-button-line-height)]';

    const sizeStyles = {
      sm: 'px-3 py-2 gap-1.5',
      md: 'px-4 py-2 gap-2',
      lg: 'text-[16px] px-6 py-3 gap-2.5',
      icon: 'w-[44px] h-[44px] p-0 rounded-full shrink-0',
    };

    const variantStyles = {
      primary:
        'bg-[var(--color-brand-500)] text-[var(--color-brand-foreground)] hover:bg-[var(--color-brand-400)] active:bg-[var(--color-brand-600)] focus-visible:ring-[var(--color-brand-500)] shadow-[var(--shadow-raised)]',
      secondary:
        'bg-[var(--color-brand-100)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-200)] active:bg-[var(--color-brand-300)] focus-visible:ring-[var(--color-brand-500)]',
      tertiary:
        'bg-transparent text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] active:bg-[var(--color-neutral-200)] focus-visible:ring-[var(--color-neutral-500)]',
      destructive:
        'bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-600)] active:bg-[var(--color-danger-700)] focus-visible:ring-[var(--color-danger-500)] shadow-[var(--shadow-raised)]',
      icon:
        'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-brand-100)] hover:text-[var(--color-brand-700)] active:bg-[var(--color-brand-200)] focus-visible:ring-[var(--color-brand-500)]',
    };

    const actualSize = variant === 'icon' ? 'icon' : size;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[actualSize],
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
        {variant !== 'icon' && <span className="truncate">{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
