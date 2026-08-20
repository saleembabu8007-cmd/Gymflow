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

export const SkeletonText: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-4 w-3/4 rounded-md', className)} />
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return <Skeleton className={cn('rounded-full shrink-0', sizeClasses[size], className)} />;
};

export const SkeletonRow: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-3.5 p-3 rounded-xl border border-neutral-100 bg-white', className)}>
    <SkeletonAvatar size="sm" />
    <div className="space-y-1.5 flex-1 min-w-0">
      <SkeletonText className="w-1/3 h-3.5" />
      <SkeletonText className="w-1/4 h-3" />
    </div>
    <Skeleton className="w-16 h-7 rounded-lg shrink-0" />
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-5 rounded-2xl border border-neutral-200/80 bg-white space-y-3', className)}>
    <SkeletonText className="w-1/4 h-3" />
    <Skeleton className="h-7 w-1/2 rounded-lg" />
    <SkeletonText className="w-1/3 h-2.5" />
  </div>
);
