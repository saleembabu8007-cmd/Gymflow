import React from 'react';
import { cn } from '../../utils/classNames';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'paid' | 'overdue';
  className?: string;
}

const identityPalettes = [
  'bg-purple-100 text-purple-800',  // Grape
  'bg-pink-100 text-pink-800',      // Flamingo
  'bg-indigo-100 text-indigo-800',  // Indigo
  'bg-emerald-100 text-emerald-800',// Mint
  'bg-rose-100 text-rose-800',      // Rose
  'bg-lime-100 text-lime-800',      // Lime
  'bg-slate-100 text-slate-800',    // Granite
  'bg-cyan-100 text-cyan-800',      // Cyan
];

function getInitials(name: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDeterministicColor(str: string): string {
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
    xs: 'w-6 h-6 text-[10px]', // 24px
    sm: 'w-8 h-8 text-xs',     // 32px
    md: 'w-10 h-10 text-sm',   // 40px
    lg: 'w-14 h-14 text-lg',   // 56px
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const renderStatusDot = () => {
    if (!status) return null;
    return (
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full ring-2 ring-white shadow-sm",
          statusDotSizes[size],
          status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'
        )}
      />
    );
  };

  if (imageUrl) {
    return (
      <div className={cn("relative inline-flex shrink-0", className)}>
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
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          'rounded-full font-bold flex items-center justify-center select-none ring-2 ring-white',
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
