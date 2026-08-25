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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none relative overflow-hidden">
      {/* HUD Schematic Grid Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full stroke-slate-200/60 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]">
          <defs>
            <pattern id="auth-grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#auth-grid-pattern)" />
        </svg>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* GymFlow Minimal Brand Mark */}
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <span className="mt-5 font-extrabold text-slate-900 text-xl sm:text-2xl tracking-tight">
            GymFlow
          </span>

          {title && (
            <h1 className="mt-2 text-[22px] sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <div className="mt-3 w-full flex justify-center">
              {typeof subtitle === 'string' ? (
                <p className="text-[15px] font-medium text-slate-600 max-w-sm mx-auto">
                  {subtitle}
                </p>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-xl py-8 px-6 sm:px-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
