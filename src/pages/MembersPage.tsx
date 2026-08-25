import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton, MemberRowSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ListSection, LoadMore } from '../components/ui';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { Member } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import { MemberRow } from '../components/ui/MemberRow';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterChips, FilterChipOption } from '../components/ui/FilterChips';
import { Search, X, Users, ChevronLeft, ChevronRight, LayoutList, AlignJustify, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { IconButton } from '../components/ui/IconButton';
import { cn } from '../utils/classNames';

interface MembersPageProps {
  onQuickPay: (member: Member) => void;
  onSendReminder: (member: Member) => void;
  onAddMember: () => void;
  onSelectMember: (member: Member) => void;
}

type FilterStatus = 'ALL' | 'ACTIVE' | 'PENDING' | 'DUE_SOON' | 'EXPIRED';
const PAGE_SIZE = 25;

export const MembersPage: React.FC<MembersPageProps> = ({
  onQuickPay,
  onSendReminder,
  onAddMember,
  onSelectMember,
}) => {
  const { members, loading, isRefreshing, isStale, error, setFilter, fetchMembers, counts } = useMembers();
  const showLoading = useDelayedLoading(loading, 400);
  const { currencySymbol } = useGymSettings();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchInput, setSearchInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recentPaymentId, setRecentPaymentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comfortable' | 'compact'>('comfortable');

  useEffect(() => {
    const handlePaymentSuccess = (e: any) => {
      const memberId = e.detail?.memberId;
      if (memberId) {
        setRecentPaymentId(memberId);
        setTimeout(() => setRecentPaymentId(null), 3000);
      }
    };
    window.addEventListener('gymflow_payment_success', handlePaymentSuccess);
    return () => window.removeEventListener('gymflow_payment_success', handlePaymentSuccess);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, search: value }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, search: '' }));
  };

  const handleFilterChange = (status: FilterStatus) => {
    setActiveFilter(status);
    setCurrentPage(1);
    setFilter((prev) => ({ ...prev, status: status }));
  };

  const filterTabs: FilterChipOption<FilterStatus>[] = [
    { id: 'ALL', label: 'All', count: counts.ALL },
    { id: 'ACTIVE', label: 'Active', badgeVariant: 'success', count: counts.ACTIVE, icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'PENDING', label: 'Pending', count: counts.PENDING },
    { id: 'DUE_SOON', label: 'Due Soon', badgeVariant: 'warning', count: counts.DUE_SOON, icon: <Clock className="w-4 h-4" /> },
    { id: 'EXPIRED', label: 'Expired', badgeVariant: 'danger', count: counts.EXPIRED, icon: <AlertCircle className="w-4 h-4" /> },
  ];

  const totalMembersCount = members.length;
  const paginatedMembers = members.slice(0, currentPage * PAGE_SIZE);
  const hasMore = currentPage * PAGE_SIZE < totalMembersCount;

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(p => p + 1);
      setIsLoadingMore(false);
    }, 400);
  };


  const isSearching = searchInput.trim().length > 0 || activeFilter !== 'ALL';
  const hasNoMembersEver = !loading && members.length === 0 && !isSearching;
  const hasNoSearchResults = !loading && members.length === 0 && isSearching;

  if (error && members.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <ErrorState
          title="Couldn't load members list"
          message="We couldn't retrieve the members directory. Please check your connection and try again."
          onRetry={fetchMembers}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
      <StaleDataNotification isStale={isStale} onRetry={() => fetchMembers(true)} isRefreshing={isRefreshing} />

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-2 scrollbar-none w-full">
        <div className="w-[260px] shrink-0">
          <SearchInput
            value={searchInput}
            onSearchChange={(val) => {
              setSearchInput(val);
              setCurrentPage(1);
              setFilter((prev) => ({ ...prev, search: val }));
            }}
            placeholder="Search name or phone..."
          />
        </div>
        
        <div className="w-px h-6 bg-slate-200 shrink-0 mx-1" />

        <FilterChips<FilterStatus>
          options={filterTabs}
          activeId={activeFilter}
          onChange={handleFilterChange}
          className="pb-0"
        />

        <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200 shrink-0 ml-auto h-[40px]">
          <IconButton
            icon={<AlignJustify className="w-4 h-4" />}
            aria-label="Comfortable view"
            variant="default"
            size="sm"
            onClick={() => setViewMode('comfortable')}
            className={cn("rounded-lg hover:bg-white hover:shadow-sm h-full w-8", viewMode === 'comfortable' && "bg-white shadow-sm text-teal-600")}
          />
          <IconButton
            icon={<LayoutList className="w-4 h-4" />}
            aria-label="Compact view"
            variant="default"
            size="sm"
            onClick={() => setViewMode('compact')}
            className={cn("rounded-lg hover:bg-white hover:shadow-sm h-full w-8", viewMode === 'compact' && "bg-white shadow-sm text-teal-600")}
          />
        </div>
      </div>

      {showLoading && members.length === 0 ? (
        <div className={cn("flex flex-col", viewMode === 'compact' ? "gap-1" : "gap-2")}>
          {[1, 2, 3, 4].map(i => (
            <MemberRowSkeleton key={i} className={cn(viewMode === 'compact' && "py-2.5 sm:py-3")} />
          ))}
        </div>
      ) : hasNoMembersEver ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="pt-8"
        >
          <EmptyState
            icon={<Users />}
            title="Add your first member"
            description="Start tracking memberships, collecting payments, and sending WhatsApp reminders from one place."
            actionLabel="Add Member"
            onAction={onAddMember}
          />
        </motion.div>
      ) : hasNoSearchResults ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="pt-8"
        >
          <EmptyState
            icon={<Search />}
            title="No members found"
            description={searchInput ? `We couldn't find anyone matching "${searchInput}".` : 'No members found with the current filter.'}
            actionLabel={searchInput ? "Clear Search" : activeFilter !== 'ALL' ? "View All Members" : undefined}
            onAction={searchInput ? handleClearSearch : activeFilter !== 'ALL' ? () => handleFilterChange('ALL') : undefined}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <ListSection
            title={activeFilter === 'ALL' ? 'All Members' : `${activeFilter} Members`}
            count={totalMembersCount}
            badgeVariant={activeFilter === 'EXPIRED' ? 'danger' : activeFilter === 'DUE_SOON' ? 'warning' : 'neutral'}
          >
            {paginatedMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currencySymbol={currencySymbol}
                onSelect={onSelectMember}
                onRemind={onSendReminder}
                onQuickPay={onQuickPay}
                highlighted={recentPaymentId === member.id}
              />
            ))}

            {hasMore && (
              <LoadMore
                onLoadMore={handleLoadMore}
                isLoading={isLoadingMore}
                hasMore={hasMore}
                className="mt-6"
              />
            )}
          </ListSection>
        </motion.div>
      )}

      {/* Mobile Sticky FAB */}
      <div className="fixed bottom-24 right-4 sm:hidden z-30">
        <button
          type="button"
          onClick={onAddMember}
          className="flex items-center justify-center w-14 h-14 bg-teal-600 text-white rounded-[20px] shadow-lg shadow-teal-600/30 active:scale-95 transition-transform"
          aria-label="Add Member"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
