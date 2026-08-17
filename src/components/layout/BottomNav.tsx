import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  MoreHorizontal,
  Bell,
  Settings,
  Building2,
  LogOut,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { BottomSheet } from '../ui/BottomSheet';
import { Avatar } from '../ui/Avatar';
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
  gymName = 'Iron Fitness',
  user,
  onLogout,
  onOpenQuickAdd,
  onOpenSearch,
  pendingCount = 0,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Primary 3 sections for direct bottom access
  const primaryTabs = [
    { id: '/app/today', label: 'Today', icon: Calendar, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: '/app/members', label: 'Members', icon: Users },
    { id: '/app/payments', label: 'Payments', icon: CreditCard },
  ];

  // Secondary items in More menu
  const secondaryItems = [
    {
      id: '/app/reminders',
      label: 'WhatsApp Reminders',
      description: 'Manage templates & dispatch logs',
      icon: Bell,
    },
    {
      id: '/app/settings',
      label: 'Gym Settings',
      description: 'Profile, UPI ID, plans & dues window',
      icon: Settings,
    },
  ];

  const isSecondaryActive = currentPath === '/app/reminders' || currentPath === '/app/settings';

  const handleSelectRoute = (path: string) => {
    onNavigate(path);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Intentional Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-1 flex items-center justify-around select-none shadow-lg"
      >
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.id ||
            (item.id === '/app/today' && (currentPath === '/app' || currentPath === '/'));

          return (
            <button
              key={item.id}
              type="button"
              id={`bottom-nav-${item.id.replace('/', '') || 'today'}`}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center min-h-[48px] py-1 px-3 rounded-xl text-[11px] font-medium transition-colors min-w-[64px] touch-manipulation',
                isActive ? 'text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 mb-0.5 transition-transform',
                    isActive ? 'text-neutral-950 stroke-[2.25] scale-105' : 'text-neutral-400'
                  )}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* More Tab Button */}
        <button
          type="button"
          id="bottom-nav-more"
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            'relative flex flex-col items-center justify-center min-h-[48px] py-1 px-3 rounded-xl text-[11px] font-medium transition-colors min-w-[64px] touch-manipulation',
            isSecondaryActive || isMoreOpen
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          )}
        >
          <div className="relative">
            <MoreHorizontal
              className={cn(
                'w-5 h-5 mb-0.5 transition-transform',
                isSecondaryActive || isMoreOpen
                  ? 'text-neutral-950 stroke-[2.25] scale-105'
                  : 'text-neutral-400'
              )}
            />
            {isSecondaryActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neutral-900 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* Secondary Navigation Bottom Sheet */}
      <BottomSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="More Operations"
        description="Access secondary workflows and gym administration"
      >
        <div className="space-y-4">
          {/* Gym & Owner Identity Header */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={user?.name || 'Owner'} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-neutral-900 truncate">
                    {user?.name || 'Account'}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-neutral-200 text-neutral-800 rounded">
                    OWNER
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                  <Building2 className="w-3 h-3 text-neutral-400" />
                  <span className="truncate">{gymName}</span>
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  onLogout();
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shrink-0 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2">
            {onOpenQuickAdd && (
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenQuickAdd();
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-900 text-white font-medium text-xs hover:bg-neutral-800 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}

            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenSearch();
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-medium text-xs hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Search (⌘K)</span>
              </button>
            )}
          </div>

          {/* Secondary Nav Links */}
          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
              Modules
            </div>

            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`more-menu-${item.id.replace('/', '')}`}
                  onClick={() => handleSelectRoute(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all',
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                        isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm leading-tight">{item.label}</div>
                      <div
                        className={cn(
                          'text-xs mt-0.5 leading-tight',
                          isActive ? 'text-white/80' : 'text-neutral-500'
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-white' : 'text-neutral-400'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
