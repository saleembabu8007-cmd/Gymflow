import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.history.pushState({}, '', '/admin/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Verifying Platform Admin Credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Redirecting to Admin Login...</span>
        </div>
      </div>
    );
  }

  const isPlatformAdmin =
    user && ((user.role as string) === 'platform_admin' || user.role === 'PLATFORM_ADMIN');

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-neutral-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Access Denied</h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Only authorized GymFlow Product Owners (<code className="text-rose-400 bg-neutral-950 px-1.5 py-0.5 rounded font-mono">platform_admin</code>) are permitted to access platform operational controls.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="destructive"
              size="md"
              onClick={logout}
              className="w-full font-semibold"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
