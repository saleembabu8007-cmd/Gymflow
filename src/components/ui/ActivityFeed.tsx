import React from 'react';
import { cn } from '../../utils/classNames';

export interface ActivityFeedProps {
  children: React.ReactNode;
  className?: string;
}

export const ActivityFeed = ({ children, className }: ActivityFeedProps) => {
  return (
    <div className={cn("relative flex flex-col", className)}>
      {children}
    </div>
  );
};

export interface ActivityFeedItemProps {
  leading: React.ReactNode;
  content: React.ReactNode;
  trailing: React.ReactNode;
  className?: string;
  isLast?: boolean;
}

export const ActivityFeedItem = ({ leading, content, trailing, className, isLast }: ActivityFeedItemProps) => {
  return (
    <div className={cn("relative flex items-start gap-3 py-3", className)}>
      {/* Connecting vertical rule */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-[-12px] w-px bg-neutral-200 z-0" />
      )}
      
      {/* Icon/Avatar wrapper - fixed width for alignment */}
      <div className="relative shrink-0 flex items-center justify-center w-6 h-6 mt-0.5 z-10 bg-white">
        {leading}
      </div>
      
      {/* Content block */}
      <div className="flex-1 min-w-0 mt-0.5">
        <div className="text-[length:var(--text-body-size)] text-neutral-900 leading-snug">
          {content}
        </div>
      </div>
      
      {/* Trailing timestamp/value */}
      <div className="shrink-0 text-right whitespace-nowrap text-[length:var(--text-caption-size)] text-neutral-500 mt-1">
        {trailing}
      </div>
    </div>
  );
};

ActivityFeed.Item = ActivityFeedItem;
