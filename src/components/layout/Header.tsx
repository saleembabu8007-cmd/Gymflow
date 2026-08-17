import React from 'react';
import { Search, Plus, Dumbbell, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType | null;
  gymName?: string;
  onOpenQuickAdd?: () => void;
  onOpenSearch?: () => void;
  onNavigateAdmin?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  gymName = 'Iron Fitness',
  onOpenQuickAdd,
  onOpenSearch,
  onNavigateAdmin,
  title,
}) => {
  return (
    <header className="h-16 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Left: Brand info on Mobile, Breadcrumb / Section Context on Desktop */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile brand indicator */}
        <div className="md:hidden flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-2xs shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-neutral-950 text-sm leading-tight tracking-tight">
              GymFlow
            </span>
            <span className="text-[10px] text-neutral-500 truncate leading-tight">
              {gymName}
            </span>
          </div>
        </div>

        {/* Desktop Breadcrumb / Title */}
        {title && (
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-neutral-400">GymFlow</span>
            <span className="text-neutral-300">/</span>
            <span className="font-bold text-neutral-900 text-sm sm:text-base tracking-tight truncate">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Quick Search, Primary Action, Owner Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Search Shortcut */}
        {onOpenSearch && (
          <button
            type="button"
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300 bg-neutral-50/80 text-xs font-medium transition-all cursor-pointer shadow-2xs"
            title="Search members or transactions (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-neutral-200 rounded text-neutral-400 font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Quick Add Member button */}
        {onOpenQuickAdd && (
          <Button
            id="header-quick-add-btn"
            size="sm"
            onClick={onOpenQuickAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}

        {/* Platform Admin Console Navigation Trigger */}
        {onNavigateAdmin && (
          <Button
            id="header-admin-console-btn"
            variant="outline"
            size="sm"
            onClick={onNavigateAdmin}
            leftIcon={<ShieldCheck className="w-4 h-4 text-rose-500" />}
            className="border-neutral-300 hover:bg-neutral-100 font-semibold"
          >
            <span className="hidden sm:inline">Admin Console</span>
            <span className="sm:hidden">Admin</span>
          </Button>
        )}

        {/* Owner Profile preview on Desktop */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200">
          <Avatar name={user?.name || 'Owner'} size="sm" />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-neutral-900 leading-tight">
              {user?.name || 'Owner'}
            </span>
            <span className="text-[10px] text-neutral-500 capitalize leading-tight">
              {user?.role ? user.role.toLowerCase() : 'Owner'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
