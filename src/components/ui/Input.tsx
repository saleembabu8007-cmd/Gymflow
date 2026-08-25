import React from 'react';
import { cn } from '../../utils/classNames';
import { Check, WarningCircle } from '@phosphor-icons/react';

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
    const cleanLabel = label?.replace(/\s*\*\s*$/, '');
    const inputId = id || (cleanLabel ? `input-${cleanLabel.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = errorId || helperId;

    const baseInputStyles =
      'w-full h-10 bg-slate-100 border-2 border-transparent rounded-[12px] text-[14px] text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none disabled:opacity-100 disabled:bg-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed';

    return (
      <div className={cn("w-full flex flex-col gap-1", className)}>
        {cleanLabel && (
          <label htmlFor={inputId} className={cn('text-[12px] font-medium select-none text-slate-700 flex items-center', labelClassName)}>
            {cleanLabel}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <span className={cn("absolute left-3 text-[14px] text-slate-600 pointer-events-none select-none tabular-nums", leftIcon && "left-9")}>
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
              prefixText === '₹' && 'tabular-nums',
              error 
                ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100' 
                : 'focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100',
            )}
            {...props}
          />
          
          {success && !error && !rightIcon && (
            <div className="absolute right-3 text-emerald-500 pointer-events-none flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5px]" />
            </div>
          )}
          {suffixText && (
            <span className={cn("absolute right-3 text-[14px] text-slate-600 pointer-events-none select-none", rightIcon && "right-10")}>
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
          <p id={errorId} role="alert" aria-live="polite" className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
            <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-slate-600 mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
