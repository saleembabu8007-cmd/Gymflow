import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-neutral-100">
      <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-[length:var(--text-heading-size)] font-bold text-white tracking-tight">Page Not Found</h1>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            The page or route you requested does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <Button
            onClick={onNavigateHome}
            className="w-full font-semibold bg-white text-neutral-950 hover:bg-neutral-200"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Return to GymFlow Home
          </Button>
        </div>
      </div>
    </div>
  );
};
