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
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
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
  { id: 'gyms', label: 'Gyms', icon: Building2 },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
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
    <div className="h-screen bg-[var(--color-bg-canvas)] text-neutral-900 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Admin Header */}
      <header className="border-b border-neutral-200/80 bg-white z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-neutral-950 text-sm tracking-tight font-display">
                GymFlow
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 text-white uppercase">
                Platform Admin
              </span>
            </div>
          </div>

          {/* User profile & logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-neutral-900">{user?.name || 'Platform Admin'}</span>
              <span className="text-[10px] text-neutral-500 font-mono">{user?.email || 'admin@gymflow.in'}</span>
            </div>
            <button
              type="button"
              id="btn-admin-logout"
              onClick={handleAdminLogout}
              className="p-1.5 rounded-[var(--radius-md)] text-neutral-500 hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-danger-200)]"
              title="Logout Platform Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Horizontal Nav Bar */}
      <div className="border-b border-neutral-200/80 bg-white shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
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
                  'px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
                  isSelected
                    ? 'bg-neutral-950 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
