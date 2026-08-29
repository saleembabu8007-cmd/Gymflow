import React from 'react';
import { Button } from './Button';
import { MemberRowSkeleton } from './Skeleton';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface LoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
}

export const LoadMore: React.FC<LoadMoreProps> = ({
  isLoading,
  hasMore,
  onLoadMore,
  className,
}) => {
  if (!hasMore) return null;

  return (
    <div className={cn("w-full py-4 flex flex-col items-center", className)}>
      {isLoading ? (
        <div className="w-full">
          <MemberRowSkeleton />
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={onLoadMore}
          rightIcon={<ChevronDown className="w-4 h-4" />}
          className="w-full sm:w-auto min-w-[200px]"
        >
          Load More
        </Button>
      )}
    </div>
  );
};
