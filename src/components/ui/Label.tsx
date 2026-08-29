import React from 'react';
import { cn } from '../../utils/classNames';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required,
  optional,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        'text-[length:var(--text-caption-size)] font-semibold text-neutral-700 flex items-center gap-1 select-none',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && <span className="text-[var(--color-danger-500)] text-xs" aria-hidden="true">*</span>}
      {optional && <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>}
    </label>
  );
};
