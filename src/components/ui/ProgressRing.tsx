import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/classNames';

export interface ProgressRingProps {
  value: number; // 0 to 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'success' | 'warning' | 'danger' | 'brand';
  caption?: string;
  label?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'auto',
  caption,
  label,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  let activeVariant = variant;
  if (variant === 'auto') {
    if (percentage >= 80) activeVariant = 'success';
    else if (percentage >= 40) activeVariant = 'warning';
    else activeVariant = 'danger';
  }

  // Define radius, stroke width, total width, and text size per size variant
  const dimensions = {
    sm: { radius: 32, stroke: 6, width: 80, fontSize: 'text-xl' },
    md: { radius: 56, stroke: 10, width: 140, fontSize: 'text-4xl' },
    lg: { radius: 80, stroke: 14, width: 200, fontSize: 'text-5xl' },
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
    success: { stroke: 'text-emerald-500', track: 'text-emerald-50' },
    warning: { stroke: 'text-amber-500', track: 'text-amber-50' },
    danger: { stroke: 'text-rose-500', track: 'text-rose-50' },
    brand: { stroke: 'text-teal-500', track: 'text-teal-50' },
    auto: { stroke: 'text-slate-500', track: 'text-slate-50' },
  };

  const colors = colorVariants[activeVariant as keyof typeof colorVariants];

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)} style={{ width, height: width }}>
      <svg
        height={width}
        width={width}
        className="absolute inset-0 -rotate-90 transform drop-shadow-sm"
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
          className={cn('transition-all duration-1000 ease-out', colors.stroke)}
        />
      </svg>
      
      {/* Centered Value and Caption */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('font-bold tracking-tighter text-slate-900 leading-none', fontSize)}>
          {label ?? `${Math.round(percentage)}%`}
        </span>
        {caption && size !== 'sm' && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-2 leading-tight">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
};
