import React from 'react';
import { Dumbbell } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50/70 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* GymFlow Minimal Brand Mark */}
        <div className="flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="mt-3 font-bold text-neutral-950 text-xl tracking-tight">
            GymFlow
          </span>

          {title && (
            <h1 className="mt-2 text-xl font-bold tracking-tight text-neutral-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-500 max-w-xs">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Container */}
        <div className="mt-6">
          <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-xs border border-neutral-200/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
