import React from 'react';
import { cn } from '../../utils/classNames';
import { Check } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  labelClassName?: string;
  variant?: 'light' | 'dark'; // Kept for backwards compatibility
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
      success,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Strip trailing asterisks from labels since we handle it automatically
    const cleanLabel = label?.replace(/\s*\*\s*$/, '');
    
    const inputId = id || (cleanLabel ? `input-${cleanLabel.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = errorId || helperId;

    const baseInputStyles =
      'w-full h-11 bg-slate-50 border-2 border-transparent rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-teal-600 focus:bg-white focus:shadow-[0_0_0_2px_rgba(13,148,136,0.1)] disabled:opacity-50 disabled:cursor-not-allowed';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {cleanLabel && (
          <label htmlFor={inputId} className={cn('text-sm font-medium select-none text-slate-700', labelClassName)}>
            {cleanLabel}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <span className={cn("absolute left-3 text-sm font-medium text-slate-500 pointer-events-none", leftIcon && "left-9")}>
              {prefixText}
            </span>
          )}
          
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              baseInputStyles,
              leftIcon ? (prefixText ? 'pl-14' : 'pl-10') : (prefixText ? 'pl-8' : 'pl-3'),
              rightIcon ? (suffixText ? 'pr-14' : 'pr-10') : (suffixText ? 'pr-8' : 'pr-3'),
              success ? 'pr-9' : '',
              error && 'border-rose-500 bg-rose-50/30 focus:border-rose-500 focus:shadow-[0_0_0_2px_rgba(225,29,72,0.15)]',
              success && !error && 'border-emerald-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)]',
              className
            )}
            {...props}
          />
          
          {success && !error && !rightIcon && (
            <div className="absolute right-3 text-emerald-500 pointer-events-none flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5px]" />
            </div>
          )}
          {suffixText && (
            <span className={cn("absolute right-3 text-sm font-medium text-slate-500 pointer-events-none", rightIcon && "right-10")}>
              {suffixText}
            </span>
          )}
          {rightIcon && (
            <div className={cn("absolute right-3 text-slate-400 flex items-center justify-center", success && "right-10")}>
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-[11px] text-rose-600 font-bold tracking-wide">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-slate-500 font-medium">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
