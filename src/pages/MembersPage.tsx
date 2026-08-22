import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { StaleDataNotification } from '../components/common/StaleDataNotification';
import { Member } from '../types';
import { useMembers } from '../hooks/useMembers';
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
  const totalPages = Math.ceil(totalMembersCount / PAGE_SIZE) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return members.slice(start, start + PAGE_SIZE);
  }, [members, currentPage]);


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

      <PageHeader
        title="Members"
        subtitle="Manage your gym members and their payments."
        actions={<Button size="md" onClick={onAddMember}>Add Member</Button>}
      />

      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:flex-1">
            <SearchInput
              value={searchInput}
              onSearchChange={(val) => {
                setSearchInput(val);
                setCurrentPage(1);
                setFilter((prev) => ({ ...prev, search: val }));
              }}
              placeholder="Search by name or phone..."
            />
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <IconButton
              icon={<AlignJustify className="w-4 h-4" />}
              aria-label="Comfortable view"
              variant="ghost"
              onClick={() => setViewMode('comfortable')}
              className={cn("rounded-lg hover:bg-white hover:shadow-sm", viewMode === 'comfortable' && "bg-white shadow-sm text-teal-600")}
            />
            <IconButton
              icon={<LayoutList className="w-4 h-4" />}
              aria-label="Compact view"
              variant="ghost"
              onClick={() => setViewMode('compact')}
              className={cn("rounded-lg hover:bg-white hover:shadow-sm", viewMode === 'compact' && "bg-white shadow-sm text-teal-600")}
            />
          </div>
        </div>

        <FilterChips<FilterStatus>
          options={filterTabs}
          activeId={activeFilter}
          onChange={handleFilterChange}
        />
      </div>

      {loading && members.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="py-4 border-b border-zinc-100 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : hasNoMembersEver ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-3xl border border-zinc-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 text-zinc-400 flex items-center justify-center mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950">Add your first member</h2>
          <p className="text-base text-zinc-500 mt-2 max-w-md">
            Start tracking memberships, collecting payments, and sending WhatsApp reminders from one place.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={onAddMember}>Add Member</Button>
          </div>
        </div>
      ) : hasNoSearchResults ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950">No members found</h2>
          <p className="text-base text-zinc-500 mt-2 max-w-md">
            {searchInput ? `We couldn't find anyone matching "${searchInput}".` : 'No members found with the current filter.'}
          </p>
          <div className="mt-6 flex gap-3">
            {searchInput && <Button variant="outline" onClick={handleClearSearch}>Clear Search</Button>}
            {activeFilter !== 'ALL' && <Button variant="secondary" onClick={() => handleFilterChange('ALL')}>View All Members</Button>}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeFilter}-${currentPage}-${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn("flex flex-col", viewMode === 'compact' ? "gap-1" : "gap-2")}
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
                className={cn(viewMode === 'compact' && "py-2.5 sm:py-3")}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between py-6 border-t border-zinc-100 mt-6 text-sm">
                <span className="text-zinc-500 hidden sm:inline-block">
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalMembersCount)} of {totalMembersCount} members
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <span className="px-3 font-semibold text-zinc-700 sm:hidden">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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
