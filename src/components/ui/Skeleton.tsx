import React from 'react';
import { cn } from '../../utils/classNames';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-neutral-200/80', className)}
      {...props}
    />
  );
};
