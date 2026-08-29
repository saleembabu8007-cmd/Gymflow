import React from 'react';
import { Logo } from '../components/ui';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 select-none font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <Logo size="md" />
            <span className="font-extrabold text-neutral-950 text-xl tracking-tight font-display">
              GymFlow
            </span>
          </div>

          {title && (
            <h1 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-display">
              {title}
            </h1>
          )}
          {subtitle && (
            <div className="mt-1.5 w-full flex justify-center text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              {typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle}
            </div>
          )}
        </div>

        {/* Focused Auth Card Container */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 rounded-[var(--radius-lg)] shadow-2xs border border-neutral-200/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
