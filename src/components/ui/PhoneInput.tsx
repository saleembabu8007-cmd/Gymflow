import React from 'react';
import { Phone } from 'lucide-react';
import { Input, InputProps } from './Input';
import { cn } from '../../utils/classNames';

export interface PhoneInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      placeholder = 'Enter phone number',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        leftIcon={<Phone className="w-4 h-4 stroke-[1.75]" />}
        placeholder={placeholder}
        className={cn('font-mono', className)}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
