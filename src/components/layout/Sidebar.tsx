import React from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  Bell,
  Settings,
  Dumbbell,
  LogOut,
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
  gymName = 'Gym Workspace',
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

  const isCurrentActive = (itemId: string) => {
    if (itemId === '/app/today') {
      return currentPath === '/app/today' || currentPath === '/app' || currentPath === '/';
    }
    return currentPath.startsWith(itemId);
  };

  return (
    <aside
      aria-label="Main Navigation"
      className="hidden md:flex flex-col w-60 border-r border-neutral-200/80 bg-white h-screen sticky top-0 shrink-0 select-none z-30 font-sans"
    >
      {/* 1. Brand & Tenant Workspace Header */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-2xs shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-neutral-950 text-sm leading-tight tracking-tight font-display truncate">
              GymFlow
            </span>
            <span className="text-[11px] text-neutral-400 font-medium truncate">
              {gymName}
            </span>
          </div>
        </div>

        {user?.role === 'PLATFORM_ADMIN' && onNavigateAdmin && (
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="p-1.5 rounded-md bg-[var(--color-danger-50)] text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100)] transition-colors cursor-pointer text-xs font-bold"
            title="Switch to Platform Admin Control Panel"
            aria-label="Platform Admin Console"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Primary Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isCurrentActive(item.id);

          return (
            <button
              key={item.id}
              type="button"
              id={`sidebar-nav-${item.label.toLowerCase()}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center justify-between px-3 h-10 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-[var(--duration-fast)] cursor-pointer group select-none',
                isActive
                  ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-neutral-950 stroke-[2.2]' : 'text-neutral-400 group-hover:text-neutral-600 stroke-[1.75]'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono',
                    item.badgeVariant === 'danger'
                      ? 'bg-[var(--color-danger-500)] text-white'
                      : 'bg-neutral-200 text-neutral-800'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Bottom User Account Profile Widget */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-[var(--radius-md)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user?.name || gymName} size="sm" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-900 truncate">
                {user?.name || 'Owner'}
              </span>
              <span className="text-[10px] text-neutral-500 truncate">
                {user?.email || gymName}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
