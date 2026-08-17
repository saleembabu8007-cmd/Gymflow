import React from 'react';
import {
  Activity,
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/classNames';

export type AdminTab = 'overview' | 'gyms' | 'subscriptions' | 'users' | 'audit' | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'gyms', label: 'Customer Gyms', icon: Building2 },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'users', label: 'Platform Users', icon: Users },
  { id: 'audit', label: 'Audit Activity', icon: ShieldCheck },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const { user, logout } = useAuth();

  const handleAdminLogout = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base leading-tight tracking-tight">
                GymFlow Platform Admin
              </span>
              <span className="text-[10px] text-rose-400 font-mono">Product Owner Control Panel</span>
            </div>
          </div>

          {/* User profile & logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{user?.name || 'Platform Admin'}</span>
              <span className="text-[10px] text-neutral-400 font-mono">{user?.email || 'admin@gymflow.in'}</span>
            </div>
            <button
              type="button"
              id="btn-admin-logout"
              onClick={handleAdminLogout}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Logout Platform Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Horizontal Nav Bar */}
      <div className="border-b border-neutral-800 bg-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`admin-nav-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
                  isSelected
                    ? 'bg-neutral-800 text-white shadow-2xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                )}
              >
                <Icon className={cn('w-4 h-4', isSelected ? 'text-rose-500' : 'text-neutral-400')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
