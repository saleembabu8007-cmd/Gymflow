import React from 'react';
import { Search, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
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
  gymName = 'Gym Workspace',
  onOpenQuickAdd,
  onOpenSearch,
  onNavigateAdmin,
  title,
  subtitle,
}) => {
  return (
    <header className="h-[60px] border-b border-neutral-200/80 bg-white/95 backdrop-blur-xs sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center shrink-0 select-none">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Left: Page Title & Optional Context Subtitle */}
        <div className="flex items-baseline gap-2 min-w-0">
          {title && (
            <h1 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight leading-tight truncate font-display">
              {title}
            </h1>
          )}
          {subtitle && (
            <span className="text-xs text-neutral-500 truncate hidden sm:inline">
              · {subtitle}
            </span>
          )}
        </div>

        {/* Right: Search, Admin Shortcut, Contextual Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Trigger */}
          {onOpenSearch && (
            <button
              type="button"
              id="header-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 h-9 px-3 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-xs font-medium"
              title="Search members or transactions (⌘K)"
              aria-label="Search members or transactions"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-white border border-neutral-200 rounded text-[10px] font-mono text-neutral-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Platform Admin Switcher */}
          {onNavigateAdmin && user?.role === 'PLATFORM_ADMIN' && (
            <Button
              id="header-admin-console-btn"
              variant="outline"
              size="sm"
              onClick={onNavigateAdmin}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />}
              className="hidden lg:flex"
            >
              Admin
            </Button>
          )}

          {/* Quick Add Member Primary Action */}
          {onOpenQuickAdd && (
            <Button
              id="header-quick-add-btn"
              variant="primary"
              size="sm"
              onClick={onOpenQuickAdd}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="rounded-full shadow-2xs"
            >
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
