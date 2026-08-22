import React from 'react';
import { Search, Plus, ShieldCheck, ChevronDown } from 'lucide-react';
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
  subtitle,
}) => {
  return (
    <header className="h-[72px] border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Left: Page Title & Subtitle */}
      <div className="flex flex-col justify-center min-w-0 py-2">
        {title && (
          <h1 className="text-xl sm:text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h1>
        )}
        {subtitle && (
          <span className="text-[13px] text-slate-500 truncate leading-snug mt-0.5 hidden sm:block">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Quick Search, Primary Action, Avatar */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Quick Search Shortcut Button */}
        {onOpenSearch && (
          <button
            type="button"
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center justify-center sm:justify-start gap-2 w-10 h-10 sm:w-auto sm:px-4 sm:h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            title="Search members or transactions (⌘K)"
          >
            <Search className="w-[18px] h-[18px] text-teal-600 stroke-[2.5]" />
            <span className="hidden sm:inline text-[15px] font-medium mr-2">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-400 font-mono shadow-sm">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Platform Admin Console Navigation Trigger */}
        {onNavigateAdmin && (
          <Button
            id="header-admin-console-btn"
            variant="outline"
            size="md"
            onClick={onNavigateAdmin}
            leftIcon={<ShieldCheck className="w-5 h-5 text-rose-500" />}
            className="hidden lg:flex border-slate-300 hover:bg-slate-100 font-semibold rounded-full px-5"
          >
            Admin Console
          </Button>
        )}

        {/* Quick Add Member button */}
        {onOpenQuickAdd && (
          <Button
            id="header-quick-add-btn"
            variant="primary"
            size="md"
            onClick={onOpenQuickAdd}
            leftIcon={<Plus className="w-5 h-5" />}
            className="rounded-full shadow-sm sm:px-5"
          >
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden text-sm">Add</span>
          </Button>
        )}

        {/* Owner Profile preview */}
        <button 
          className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-slate-200 cursor-pointer group outline-none"
        >
          <Avatar name={user?.name || 'Owner'} size="md" />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-teal-600 transition-colors">
              {user?.name || 'Owner'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 capitalize leading-tight">
              {user?.role ? user.role.toLowerCase() : 'Owner'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
