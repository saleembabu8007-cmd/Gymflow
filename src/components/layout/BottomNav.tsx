import React from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  Bell,
  Settings,
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { User as UserType } from '../../types';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  gymName?: string;
  user?: UserType | null;
  onLogout?: () => void;
  onOpenQuickAdd?: () => void;
  onOpenSearch?: () => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPath,
  onNavigate,
  pendingCount = 0,
}) => {
  const tabs = [
    {
      id: '/app/today',
      label: 'Today',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : undefined,
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
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-sm font-sans"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = isCurrentActive(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            id={`bottom-nav-${tab.label.toLowerCase()}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center justify-center min-h-[48px] py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-[var(--duration-fast)] flex-1 cursor-pointer touch-manipulation',
              isActive
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            )}
          >
            <div className="relative flex items-center justify-center mb-0.5">
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform',
                  isActive ? 'stroke-[2.2] scale-110 text-neutral-950' : 'stroke-[1.75] text-neutral-400'
                )}
              />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[var(--color-danger-500)] text-white text-[9px] font-bold font-mono flex items-center justify-center ring-2 ring-white">
                  {tab.badge}
                </span>
              )}
            </div>

            <span className="truncate leading-tight">{tab.label}</span>

            {/* Active indicator dot */}
            {isActive && (
              <span
                className="w-1 h-1 rounded-full bg-[var(--color-brand-500)] mt-0.5 ring-1 ring-neutral-900"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
