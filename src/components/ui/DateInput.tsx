import React from 'react';
import { Calendar } from 'lucide-react';
import { Input, InputProps } from './Input';
import { cn } from '../../utils/classNames';

export interface DateInputProps extends Omit<InputProps, 'type'> {}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      leftIcon = <Calendar className="w-4 h-4 stroke-[1.75]" />,
      ...props
    },
    ref
  ) => {
    return (
      <Input
        ref={ref}
        type="date"
        leftIcon={leftIcon}
        className={cn('font-mono', className)}
        {...props}
      />
    );
  }
);

DateInput.displayName = 'DateInput';
