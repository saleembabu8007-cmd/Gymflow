import React from 'react';
import { cn } from '../../utils/classNames';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'paid' | 'overdue' | 'active' | 'inactive';
  className?: string;
}

const identityPalettes = [
  'bg-neutral-900 text-white',
  'bg-neutral-800 text-neutral-100',
  'bg-neutral-700 text-neutral-100',
  'bg-stone-800 text-stone-100',
  'bg-stone-700 text-stone-100',
  'bg-amber-900/90 text-amber-100',
  'bg-emerald-900/90 text-emerald-100',
  'bg-blue-900/90 text-blue-100',
];

function getInitials(name: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDeterministicColor(str: string): string {
  if (!str) return identityPalettes[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % identityPalettes.length;
  return identityPalettes[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  status,
  className,
}) => {
  const initials = getInitials(name);
  const colorClass = getDeterministicColor(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',   // 24px
    sm: 'w-8 h-8 text-[12px]',   // 32px
    md: 'w-10 h-10 text-[14px]', // 40px
    lg: 'w-12 h-12 text-[16px]', // 48px
    xl: 'w-14 h-14 text-[18px]', // 56px
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  const statusColorMap = {
    paid: 'bg-[var(--color-success-500)]',
    active: 'bg-[var(--color-success-500)]',
    overdue: 'bg-[var(--color-danger-500)]',
    inactive: 'bg-neutral-400',
  };

  const renderStatusDot = () => {
    if (!status) return null;
    return (
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full ring-2 ring-white shadow-xs",
          statusDotSizes[size],
          statusColorMap[status]
        )}
      />
    );
  };

  if (imageUrl) {
    return (
      <div className={cn("relative inline-flex shrink-0 select-none", className)}>
        <img
          src={imageUrl}
          alt={name}
          className={cn(
            'rounded-full object-cover ring-2 ring-white',
            sizeClasses[size]
          )}
        />
        {renderStatusDot()}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", className)}>
      <div
        className={cn(
          'rounded-full font-bold flex items-center justify-center ring-2 ring-white shadow-2xs font-sans',
          sizeClasses[size],
          colorClass
        )}
        title={name}
      >
        {initials}
      </div>
      {renderStatusDot()}
    </div>
  );
};

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  size = 'sm',
  className,
}) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-12 h-12 text-[16px]',
  };

  return (
    <div className={cn('flex items-center -space-x-2 overflow-hidden select-none', className)}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="inline-block ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
