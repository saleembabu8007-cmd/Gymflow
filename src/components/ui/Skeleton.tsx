import React from 'react';
import { cn } from '../../utils/classNames';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded bg-neutral-200/60', className)}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{
  variant?: 'title' | 'heading' | 'body' | 'caption';
  className?: string;
}> = ({ variant = 'body', className }) => {
  const heights = {
    title: 'h-7',
    heading: 'h-5',
    body: 'h-4',
    caption: 'h-3',
  };
  return <Skeleton className={cn(heights[variant], 'w-3/4 rounded-[var(--radius-sm)]', className)} />;
};

export const SkeletonAvatar: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return <Skeleton className={cn('rounded-full shrink-0', sizeClasses[size], className)} />;
};

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 rounded-[var(--radius-lg)] border border-neutral-200/80 bg-white shadow-2xs space-y-3', className)}>
    <div className="flex items-center justify-between">
      <SkeletonText className="w-20 h-3.5" />
      <Skeleton className="w-6 h-6 rounded-full shrink-0" />
    </div>
    <div className="space-y-1.5 pt-1">
      <SkeletonText className="w-28 h-6" />
      <SkeletonText className="w-36 h-3" />
    </div>
  </div>
);

export const MemberRowSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white',
      className
    )}
  >
    <div className="flex items-center gap-3.5 min-w-0 flex-1">
      <SkeletonAvatar size="md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonText className="w-32 h-4" />
          <Skeleton className="w-14 h-4 rounded-full" />
        </div>
        <SkeletonText className="w-24 h-3" />
      </div>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
      <div className="space-y-1.5 text-right hidden sm:block">
        <Skeleton className="w-16 h-4 ml-auto" />
        <Skeleton className="w-12 h-3 ml-auto" />
      </div>
      <Skeleton className="w-20 h-7 rounded-full" />
    </div>
  </div>
);

export const ListSectionSkeleton: React.FC<{ itemsCount?: number; className?: string }> = ({
  itemsCount = 3,
  className,
}) => (
  <div className={cn('bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden', className)}>
    {Array.from({ length: itemsCount }).map((_, i) => (
      <MemberRowSkeleton key={i} />
    ))}
  </div>
);

export const SearchResultSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center justify-between p-3 border-b border-neutral-100 last:border-b-0', className)}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <SkeletonAvatar size="sm" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <SkeletonText className="w-24 h-3.5" />
        <SkeletonText className="w-32 h-2.5" />
      </div>
    </div>
  </div>
);
