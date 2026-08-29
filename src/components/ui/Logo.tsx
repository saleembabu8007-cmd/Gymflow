import React from 'react';
import { cn } from '../../utils/classNames';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6 rounded-[var(--radius-sm)]',
  md: 'w-8 h-8 rounded-[var(--radius-md)]',
  lg: 'w-10 h-10 rounded-[var(--radius-lg)]',
  xl: 'w-12 h-12 rounded-[var(--radius-xl)]',
};

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  return (
    <div
      className={cn(
        'relative bg-neutral-950 flex items-center justify-center shadow-2xs overflow-hidden shrink-0 border border-neutral-900',
        sizeClasses[size],
        className
      )}
    >
      {/* Crisp GymFlow mark */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[60%] h-[60%] relative z-10"
        aria-hidden="true"
      >
        <path
          d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12H13V14.5H17.25C16.3 16.6 14.3 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C13.4 6 14.6 6.5 15.6 7.3L17.1 5.8C15.8 4.6 14 4 12 4Z"
          fill="currentColor"
          className="text-white"
        />
        <path
          d="M20 12L15 7V11H13V13H15V17L20 12Z"
          fill="currentColor"
          className="text-[var(--color-brand-500)]"
        />
      </svg>
    </div>
  );
};
