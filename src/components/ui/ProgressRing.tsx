import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/classNames';

export interface ProgressRingProps {
  value: number; // 0 to 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'success' | 'warning' | 'danger' | 'brand';
  caption?: string;
  label?: React.ReactNode;
  textColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'auto',
  caption,
  label,
  textColor = 'text-neutral-950',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  let activeVariant = variant;
  if (variant === 'auto') {
    if (percentage >= 80) activeVariant = 'success';
    else if (percentage >= 40) activeVariant = 'warning';
    else activeVariant = 'danger';
  }

  const dimensions = {
    sm: { radius: 28, stroke: 5, width: 68, fontSize: 'text-base' },
    md: { radius: 48, stroke: 8, width: 116, fontSize: 'text-2xl' },
    lg: { radius: 70, stroke: 12, width: 168, fontSize: 'text-4xl' },
  };

  const { radius, stroke, width, fontSize } = dimensions[size];
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffsetTarget = circumference - (percentage / 100) * circumference;

  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStrokeDashoffset(strokeDashoffsetTarget);
    }, 50);
    return () => clearTimeout(timer);
  }, [strokeDashoffsetTarget]);

  const colorVariants = {
    success: { stroke: 'text-[var(--color-success-500)]', track: 'text-[var(--color-success-100)]' },
    warning: { stroke: 'text-[var(--color-warning-500)]', track: 'text-[var(--color-warning-100)]' },
    danger: { stroke: 'text-[var(--color-danger-500)]', track: 'text-[var(--color-danger-100)]' },
    brand: { stroke: 'text-[var(--color-brand-500)]', track: 'text-[var(--color-brand-100)]' },
    auto: { stroke: 'text-neutral-900', track: 'text-neutral-100' },
  };

  const colors = colorVariants[activeVariant as keyof typeof colorVariants];

  return (
    <div className={cn('relative flex flex-col items-center justify-center select-none font-sans', className)} style={{ width, height: width }}>
      <svg
        height={width}
        width={width}
        className="absolute inset-0 -rotate-90 transform"
      >
        {/* Background Track */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={width / 2}
          cy={width / 2}
          className={cn('transition-colors', colors.track)}
        />
        {/* Progress Arc */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={width / 2}
          cy={width / 2}
          className={cn('transition-all duration-700 ease-out', colors.stroke)}
        />
      </svg>

      {/* Centered Value and Caption */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('font-bold font-display tabular-nums tracking-tight leading-none', fontSize, textColor)}>
          {label ?? `${Math.round(percentage)}%`}
        </span>
        {caption && size !== 'sm' && (
          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider mt-1 px-1 leading-tight">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
};
