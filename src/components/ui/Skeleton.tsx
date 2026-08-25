import React from 'react';
import { cn } from '../../utils/classNames';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-shimmer rounded bg-slate-100', className)}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-4 w-3/4 rounded-md', className)} />
);

export const SkeletonAvatar: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  return <Skeleton className={cn('rounded-full shrink-0', sizeClasses[size], className)} />;
};

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 rounded-[20px] border relative flex flex-col bg-white border-slate-100 shadow-sm min-h-[140px]', className)}>
    <div className="flex items-start justify-between gap-4 mb-6">
      <SkeletonText className="w-24 h-4" />
      <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
    </div>
    <div className="mt-auto space-y-3">
      <SkeletonText className="w-16 h-8" />
      <SkeletonText className="w-32 h-3" />
    </div>
  </div>
);

export const MemberRowSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[20px] border bg-white border-slate-100 shadow-sm", className)}>
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <SkeletonAvatar size="md" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <SkeletonText className="w-32 h-5" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <SkeletonText className="w-24 h-3.5" />
      </div>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
      <div className="text-left sm:text-right space-y-2 sm:block flex-1 sm:flex-none">
        <SkeletonText className="w-16 h-3 sm:ml-auto" />
        <SkeletonText className="w-12 h-4 sm:ml-auto" />
      </div>
      <Skeleton className="w-full sm:w-24 h-10 rounded-[12px]" />
    </div>
  </div>
);

export const ListSectionSkeleton: React.FC<{ itemsCount?: number; className?: string }> = ({ 
  itemsCount = 3, 
  className 
}) => (
  <section className={cn("relative", className)}>
    <div className="sticky top-[72px] z-10 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shadow-[0_4px_12px_rgba(255,255,255,1)]">
      <SkeletonText className="w-24 h-4" />
      <Skeleton className="w-6 h-4 rounded-full shrink-0" />
    </div>
    <div className="flex flex-col gap-3 py-4">
      {Array.from({ length: itemsCount }).map((_, i) => (
        <MemberRowSkeleton key={i} />
      ))}
    </div>
  </section>
);

export const SearchResultSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center justify-between p-2.5 rounded-xl", className)}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <SkeletonAvatar size="sm" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonText className="w-24 h-4" />
        <SkeletonText className="w-32 h-3" />
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);
