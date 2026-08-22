import React from 'react';
import { Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-teal-100/30 rounded-b-[100%] blur-[120px] pointer-events-none" aria-hidden="true" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* GymFlow Minimal Brand Mark */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="mt-4 font-extrabold text-slate-900 text-xl sm:text-2xl tracking-tight">
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
                <p className="text-[15px] font-medium text-slate-500 max-w-sm mx-auto">
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
