import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type ChevronDirection = 'up' | 'down' | 'left' | 'right';
export type ChevronSize = 'sm' | 'md' | 'lg';

export interface ChevronProps extends React.SVGProps<SVGSVGElement> {
  direction?: ChevronDirection;
  size?: ChevronSize;
  className?: string;
}

export const Chevron: React.FC<ChevronProps> = ({
  direction = 'right',
  size = 'md',
  className,
  ...props
}) => {
  const sizeClasses: Record<ChevronSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const icons: Record<ChevronDirection, React.ComponentType<{ className?: string }>> = {
    up: ChevronUp,
    down: ChevronDown,
    left: ChevronLeft,
    right: ChevronRight,
  };

  const IconComponent = icons[direction];

  return (
    <IconComponent
      aria-hidden="true"
      className={cn('shrink-0 stroke-[2] transition-transform select-none', sizeClasses[size], className)}
      {...props}
    />
  );
};
