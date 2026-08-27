import React from 'react';
import { cn } from '../../utils/classNames';
import { Check, AlertCircle } from 'lucide-react';

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
  variant?: 'light' | 'dark'; // Ignored, kept for backwards compatibility during transition
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      labelClassName,
      variant,
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
    const cleanLabel = label?.replace(/\s*\*\s*$/, '');
    const inputId = id || (cleanLabel ? `input-${cleanLabel.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = error ? errorId : (helperText ? helperId : undefined);

    const baseInputStyles =
      'w-full min-h-[44px] bg-neutral-100 border-2 border-transparent rounded-[var(--radius-md)] text-[length:var(--text-body-size)] text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-600 disabled:cursor-not-allowed shadow-sm';

    return (
      <div className={cn("w-full flex flex-col gap-1.5", className)}>
        {cleanLabel && (
          <label 
            htmlFor={inputId} 
            className={cn('text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)] text-neutral-700 flex items-center select-none', labelClassName)}
          >
            {cleanLabel}
            {required && <span className="text-[var(--color-danger-500)] ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <span className={cn("absolute left-3 text-[length:var(--text-body-size)] text-neutral-600 pointer-events-none select-none tabular-nums", leftIcon && "left-9")}>
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
              success ? 'pr-10' : '',
              prefixText === '₹' && 'tabular-nums',
              error 
                ? 'border-[var(--color-danger-500)] bg-[var(--color-danger-50)] focus:border-[var(--color-danger-500)] focus:bg-white focus:ring-[3px] focus:ring-[var(--color-danger-500)]/20' 
                : 'focus:border-[var(--color-brand-500)] focus:bg-white focus:ring-[3px] focus:ring-[var(--color-brand-500)]/20',
            )}
            {...props}
          />
          
          {success && !error && !rightIcon && (
            <div className="absolute right-3 text-[var(--color-success-500)] pointer-events-none flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          )}
          {suffixText && (
            <span className={cn("absolute right-3 text-[length:var(--text-body-size)] text-neutral-600 pointer-events-none select-none", rightIcon && "right-10")}>
              {suffixText}
            </span>
          )}
          {rightIcon && (
            <div className={cn("absolute right-3 text-neutral-400 flex items-center justify-center", success && "right-10")}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Error message completely replaces helper text when present */}
        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-[length:var(--text-micro-size)] text-[var(--color-danger-600)] font-[var(--text-micro-weight)] flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[length:var(--text-micro-size)] font-[var(--text-micro-weight)] text-neutral-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
