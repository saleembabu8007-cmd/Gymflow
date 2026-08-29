import React from 'react';
import { cn } from '../../utils/classNames';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  as: Component = 'h2',
  children,
  className,
  ...props
}) => {
  const sizeClasses = {
    h1: 'text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950 font-display',
    h2: 'text-sm sm:text-base font-bold tracking-tight text-neutral-950 font-display',
    h3: 'text-sm font-bold text-neutral-950',
    h4: 'text-xs font-bold text-neutral-950',
    h5: 'text-xs font-semibold text-neutral-950',
    h6: 'text-[11px] font-bold text-neutral-500 uppercase tracking-wider',
  };

  return (
    <Component className={cn(sizeClasses[Component], className)} {...props}>
      {children}
    </Component>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'danger' | 'mono';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  size = 'sm',
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  const sizeClasses = {
    xs: 'text-[11px] sm:text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  };

  const variantClasses = {
    primary: 'text-neutral-900 font-semibold',
    secondary: 'text-neutral-600 font-medium',
    tertiary: 'text-neutral-500 font-normal',
    muted: 'text-neutral-400 font-normal',
    danger: 'text-[var(--color-danger-600)] font-semibold',
    mono: 'font-mono text-neutral-500 font-normal tabular-nums',
  };

  return (
    <p className={cn(sizeClasses[size], variantClasses[variant], className)} {...props}>
      {children}
    </p>
  );
};

export interface MoneyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  currency?: string;
}

export const MoneyText: React.FC<MoneyTextProps> = ({
  amount,
  currency = '₹',
  className,
  ...props
}) => {
  return (
    <span className={cn('font-mono font-bold text-neutral-950 tracking-tight tabular-nums', className)} {...props}>
      <span className="text-neutral-500 font-medium mr-0.5">{currency}</span>
      {amount.toLocaleString('en-IN')}
    </span>
  );
};
