import React from 'react';
import { cn } from '../../utils/classNames';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorText,
      required,
      disabled,
      className,
      id,
      value,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-neutral-900 select-none">
            {label}
            {required && <span className="text-rose-600 ml-1" title="Required">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          rows={rows}
          value={value}
          className={cn(
            'w-full px-0 py-2.5 bg-transparent border-b border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 transition-all duration-150 resize-y',
            'focus:outline-none focus:border-zinc-950',
            errorText && 'border-rose-500 focus:border-rose-600',
            disabled && 'opacity-50 cursor-not-allowed resize-none',
            className
          )}
          {...props}
        />

        {errorText ? (
          <p className="text-xs font-medium text-rose-600 animate-in fade-in-50">{errorText}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
