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
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* GymFlow Minimal Brand Mark */}
        <div className="flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="mt-3 font-extrabold text-zinc-950 text-xl sm:text-2xl tracking-tight">
            GymFlow
          </span>

          {title && (
            <h1 className="mt-2 text-sm sm:text-base font-bold tracking-tight text-zinc-950">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-zinc-600 max-w-xs">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Container */}
        <div className="mt-6">
          <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-zinc-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
