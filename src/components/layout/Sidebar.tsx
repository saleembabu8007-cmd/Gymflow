import React from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  Bell,
  Settings,
  Dumbbell,
  LogOut,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { Avatar } from '../ui/Avatar';
import { User as UserType } from '../../types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'danger' | 'neutral';
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigateAdmin?: () => void;
  gymName?: string;
  user?: UserType | null;
  onLogout?: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onNavigateAdmin,
  gymName = 'Iron Fitness',
  user,
  onLogout,
  pendingCount = 0,
}) => {
  const navItems: NavItem[] = [
    {
      id: '/app/today',
      label: 'Today',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeVariant: 'danger',
    },
    { id: '/app/members', label: 'Members', icon: Users },
    { id: '/app/payments', label: 'Payments', icon: CreditCard },
    { id: '/app/reminders', label: 'Reminders', icon: Bell },
    { id: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      aria-label="Main Navigation"
      className="hidden md:flex flex-col w-64 border-r border-neutral-200/80 bg-white h-screen sticky top-0 shrink-0 select-none z-30"
    >
      {/* 1. Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-2xs shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-neutral-950 text-base leading-tight tracking-tight">
              GymFlow
            </span>
            <span className="text-[10px] text-neutral-400 font-medium truncate">
              Gym Workspace
            </span>
          </div>
        </div>

        {user?.role === 'PLATFORM_ADMIN' && onNavigateAdmin && (
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer text-xs font-bold"
            title="Switch to Platform Admin Control Panel"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Primary Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="px-2 pb-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
          Gym Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.id ||
            (item.id === '/app/today' && (currentPath === '/app' || currentPath === '/'));

          return (
            <button
              key={item.id}
              type="button"
              id={`sidebar-nav-${item.id.replace('/', '') || 'today'}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center justify-between px-3 py-3 rounded-[var(--radius-lg)] text-[15px] font-medium transition-all group cursor-pointer text-left',
                isActive
                  ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)] font-bold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon
                  className={cn(
                    'w-[22px] h-[22px] shrink-0 transition-colors stroke-[2]',
                    isActive ? 'text-[var(--color-brand-500)] fill-[var(--color-brand-100)]' : 'text-neutral-400 group-hover:text-neutral-600 fill-transparent'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-bold rounded-full ml-2 shrink-0',
                    isActive
                      ? 'bg-rose-500 text-white' // Override badge to stand out on brand bg
                      : item.badgeVariant === 'danger'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Tenant Info & User Footer */}
      <div className="p-4 border-t border-slate-200/80 space-y-3 bg-slate-50/50">
        {onNavigateAdmin && (
          <button
            type="button"
            id="sidebar-admin-console-btn"
            onClick={onNavigateAdmin}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-[18px] h-[18px] text-rose-400" />
              <span>Platform Admin Console</span>
            </div>
          </button>
        )}

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:border-slate-300">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold truncate text-slate-900 leading-tight">
              {gymName}
            </span>
            <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 leading-tight mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Active Tenant
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar name={user?.name || 'Account'} size="md" />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900 truncate leading-tight">
                {user?.name || 'Account'}
              </span>
              <span className="text-[11px] text-slate-600 truncate leading-tight mt-0.5">
                {user?.email || 'Owner'}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              title="Sign out"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
