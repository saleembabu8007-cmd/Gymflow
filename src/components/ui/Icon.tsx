import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type IconSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
export type IconStroke = 'subtle' | 'normal' | 'medium' | 'bold';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: IconSize;
  stroke?: IconStroke;
  className?: string;
  'aria-label'?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: LucideComponent,
  size = 'base',
  stroke = 'normal',
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const sizeMap: Record<IconSize, string> = {
    xs: 'w-3 h-3',       // 12px
    sm: 'w-3.5 h-3.5',   // 14px
    base: 'w-4 h-4',     // 16px
    md: 'w-5 h-5',       // 20px
    lg: 'w-6 h-6',       // 24px
    xl: 'w-8 h-8',       // 32px
    '2xl': 'w-12 h-12',  // 48px
  };

  const strokeMap: Record<IconStroke, string> = {
    subtle: 'stroke-[1.5]',
    normal: 'stroke-[1.75]',
    medium: 'stroke-2',
    bold: 'stroke-[2.5]',
  };

  return (
    <LucideComponent
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      className={cn(
        'shrink-0 select-none transition-colors',
        sizeMap[size],
        strokeMap[stroke],
        className
      )}
      {...props}
    />
  );
};
