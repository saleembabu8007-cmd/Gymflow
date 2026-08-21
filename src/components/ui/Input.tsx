import React from 'react';
import { cn } from '../../utils/classNames';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  labelClassName?: string;
  variant?: 'light' | 'dark';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      labelClassName,
      variant = 'light',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = errorId || helperId;

    const isDark = variant === 'dark' || Boolean(className && (className.includes('bg-neutral-9') || className.includes('bg-black') || className.includes('bg-zinc-950')));

    const baseInputStyles = isDark
      ? 'w-full h-10 bg-transparent border-b border-zinc-800 px-0 text-sm text-white placeholder:text-zinc-500 transition-colors focus:outline-none focus:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed'
      : 'w-full h-10 bg-transparent border-b border-zinc-200 px-0 text-sm text-zinc-950 placeholder:text-zinc-400 transition-colors focus:outline-none focus:border-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('text-xs font-semibold select-none', isDark ? 'text-zinc-300' : 'text-zinc-800', labelClassName)}>
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-0 text-zinc-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <span className="absolute left-0 text-sm font-medium text-zinc-500 pointer-events-none">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              baseInputStyles,
              leftIcon && 'pl-8',
              prefixText && 'pl-8',
              rightIcon && 'pr-8',
              suffixText && 'pr-8',
              error && (isDark ? 'border-rose-500 text-rose-300' : 'border-rose-500 focus:border-rose-600 text-rose-950'),
              className
            )}
            {...props}
          />
          {suffixText && (
            <span className="absolute right-0 text-sm font-medium text-zinc-500 pointer-events-none">
              {suffixText}
            </span>
          )}
          {rightIcon && (
            <div className="absolute right-0 text-zinc-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-rose-600 font-medium flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className={cn('text-xs', isDark ? 'text-zinc-400' : 'text-zinc-500')}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
