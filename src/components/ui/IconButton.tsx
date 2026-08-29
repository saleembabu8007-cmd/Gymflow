import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type IconButtonVariant = 'default' | 'ghost' | 'primary' | 'destructive' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
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
    const sizeClasses: Record<IconButtonSize, string> = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-11 h-11 text-base',
    };

    const variantClasses: Record<IconButtonVariant, string> = {
      default:
        'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-300 focus-visible:ring-neutral-900',
      ghost:
        'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:ring-neutral-900',
      outline:
        'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 focus-visible:ring-neutral-900',
      primary:
        'bg-[var(--color-brand-500)] text-neutral-950 hover:bg-[var(--color-brand-400)] active:bg-[var(--color-brand-600)] focus-visible:ring-[var(--color-brand-500)]',
      destructive:
        'bg-neutral-100 text-neutral-700 hover:bg-[var(--color-danger-50)] hover:text-[var(--color-danger-600)] active:bg-[var(--color-danger-100)] focus-visible:ring-[var(--color-danger-500)]',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        title={title || ariaLabel}
        disabled={disabled || isLoading}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full font-medium transition-all duration-[var(--duration-fast)] shrink-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Accessible touch target pseudo-element
          'before:absolute before:-inset-1.5 before:content-[\'\'] before:pointer-events-auto sm:before:hidden',
          sizeClasses[size],
          variantClasses[variant],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
