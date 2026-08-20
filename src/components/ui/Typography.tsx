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
    h1: 'text-2xl font-extrabold tracking-tight text-neutral-950',
    h2: 'text-lg font-bold tracking-tight text-neutral-950',
    h3: 'text-base font-bold text-neutral-950',
    h4: 'text-sm font-bold text-neutral-950',
    h5: 'text-xs font-bold text-neutral-950',
    h6: 'text-[11px] font-bold text-neutral-950 uppercase tracking-wider',
  };

  return (
    <Component className={cn(sizeClasses[Component], className)} {...props}>
      {children}
    </Component>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'danger';
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
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    primary: 'text-neutral-950 font-normal',
    secondary: 'text-neutral-700 font-medium',
    tertiary: 'text-neutral-500 font-medium',
    muted: 'text-neutral-400 font-normal',
    danger: 'text-rose-600 font-semibold',
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
    <label className={cn('block text-xs font-bold text-neutral-900 select-none', className)} {...props}>
      {children}
      {required && <span className="text-rose-600 ml-1" title="Required">*</span>}
    </label>
  );
};
