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
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
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

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-neutral-700 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-neutral-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <span className="absolute left-3.5 text-sm font-medium text-neutral-500 pointer-events-none">
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
              'w-full h-10 rounded-xl bg-white border border-neutral-200 px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors shadow-2xs focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              prefixText && 'pl-8',
              rightIcon && 'pr-10',
              suffixText && 'pr-10',
              error && 'border-rose-400 focus:border-rose-600 focus:ring-rose-600 text-rose-950',
              className
            )}
            {...props}
          />
          {suffixText && (
            <span className="absolute right-3.5 text-sm font-medium text-neutral-500 pointer-events-none">
              {suffixText}
            </span>
          )}
          {rightIcon && (
            <div className="absolute right-3.5 text-neutral-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-rose-600 font-medium flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-neutral-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
