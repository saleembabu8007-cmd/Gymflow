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
    h1: 'text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950', // Tier 1: Display Heading
    h2: 'text-sm sm:text-base font-bold tracking-tight text-zinc-950',    // Tier 2: Section Heading
    h3: 'text-sm font-bold text-zinc-950',
    h4: 'text-xs font-bold text-zinc-950',
    h5: 'text-xs font-semibold text-zinc-950',
    h6: 'text-[11px] font-bold text-zinc-500 uppercase tracking-wider',
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
    primary: 'text-zinc-900 font-semibold',       // Tier 3: Body & Item
    secondary: 'text-zinc-600 font-medium',       // Tier 4: Secondary Context
    tertiary: 'text-zinc-500 font-normal',
    muted: 'text-zinc-400 font-normal',
    danger: 'text-rose-600 font-semibold',
    mono: 'font-mono text-zinc-400 font-normal',  // Tier 6: Micro Metadata
  };

  return (
    <p className={cn(sizeClasses[size], variantClasses[variant], className)} {...props}>
      {children}
    </p>
  );
};

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required,
  className,
  ...props
}) => {
  return (
    <label className={cn('block text-xs font-bold text-zinc-800 select-none', className)} {...props}>
      {children}
      {required && <span className="text-rose-600 ml-1" title="Required">*</span>}
    </label>
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
    <span className={cn('font-mono font-bold text-zinc-950 tracking-tight', className)} {...props}>
      <span className="text-zinc-500 font-medium mr-0.5">{currency}</span>
      {amount.toLocaleString('en-IN')}
    </span>
  );
};

export interface MonoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const MonoText: React.FC<MonoTextProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span className={cn('font-mono font-bold text-zinc-950', className)} {...props}>
      {children}
    </span>
  );
};
