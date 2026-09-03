import React from 'react';
import { Input, InputProps } from './Input';
import { cn } from '../../utils/classNames';

export interface CurrencyInputProps extends Omit<InputProps, 'prefixText' | 'type'> {
  currencySymbol?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      currencySymbol = '₹',
      className,
      placeholder = '0.00',
      ...props
    },
    ref
  ) => {
    return (
      <Input
        ref={ref}
        type="number"
        step="any"
        min="0"
        prefixText={currencySymbol}
        placeholder={placeholder}
        className={cn('font-mono', className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
