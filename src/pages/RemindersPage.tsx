import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { MemberRowSkeleton } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { TwoTierNumber } from '../components/ui/TwoTierNumber';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Member, Reminder, ReminderChannel, ReminderStatus } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useReminders } from '../hooks/useReminders';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import { MemberRow } from '../components/ui/MemberRow';
import {
  MessageSquare,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  RotateCw,
  Send,
  Bell
} from 'lucide-react';
import { cn } from '../utils/classNames';

interface RemindersPageProps {
  onSendReminder?: (member: Member) => void;
  onQuickPay?: (member: Member) => void;
  onSelectMember?: (member: Member) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  onSendReminder,
  onQuickPay,
  onSelectMember,
}) => {
  const { members, loading: loadingMembers, error: membersError, fetchMembers } = useMembers();
  const { reminders, loading: loadingReminders, error: remindersError, refresh: fetchReminders } = useReminders();

  const showLoadingMembers = useDelayedLoading(loadingMembers, 300);
  const showLoadingReminders = useDelayedLoading(loadingReminders, 300);
  const { currencySymbol } = useGymSettings();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // 1. Members requiring attention (Overdue, Due today, or Due in next 3 days)
  const needsReminderList = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== 'ACTIVE') return false;
        const diff = getDifferenceInDays(m.nextPaymentDate);
        return diff <= 3;
      })
      .sort((a, b) => {
        const diffA = getDifferenceInDays(a.nextPaymentDate);
        const diffB = getDifferenceInDays(b.nextPaymentDate);
        return diffA - diffB; // Most overdue first
      });
  }, [members]);

  // 2. Sent reminders filtered by search and channel
  const filteredSentReminders = useMemo(() => {
    return reminders.filter((r) => {
      if (channelFilter !== 'ALL' && r.channel !== channelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (r.memberName || '').toLowerCase().includes(q);
        const matchesPhone = (r.memberPhone || '').includes(q);
        const matchesMessage = (r.message || '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesMessage;
      }
      return true;
    });
  }, [reminders, channelFilter, searchQuery]);

  const handleRefresh = () => {
    fetchMembers(false);
    fetchReminders();
  };

  const getChannelIcon = (channel: ReminderChannel) => {
    switch (channel) {
      case 'WHATSAPP':
        return <MessageSquare className="w-3 h-3 text-[var(--color-success-700)]" />;
      case 'SMS':
        return <Smartphone className="w-3 h-3 text-[var(--color-info-700)]" />;
      case 'EMAIL':
        return <Mail className="w-3 h-3 text-neutral-600" />;
      default:
        return <Bell className="w-3 h-3 text-neutral-600" />;
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-success-50)] text-[var(--color-success-700)] border border-[var(--color-success-200)]">
            <CheckCircle2 className="w-2.5 h-2.5" /> Sent
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border border-[var(--color-danger-200)]">
            <AlertCircle className="w-2.5 h-2.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-warning-50)] text-[var(--color-warning-700)] border border-[var(--color-warning-200)]">
            <Clock className="w-2.5 h-2.5" /> Opened
          </span>
        );
    }
  };

  if ((membersError && members.length === 0) || (remindersError && reminders.length === 0)) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Couldn't load reminders"
          message="We were unable to retrieve your reminders. Please check your connection and try again."
          onRetry={handleRefresh}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none font-sans max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. SECTION: NEEDS REMINDER (Primary Operational Queue)                   */}
      {/* ========================================================================= */}
      <section aria-labelledby="needs-reminder-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Needs Follow-Up"
            count={needsReminderList.length}
            subtitle="Overdue & approaching dues"
          />

          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh follow-up list"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border border-neutral-200/80 cursor-pointer shadow-2xs shrink-0"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {showLoadingMembers && members.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <MemberRowSkeleton key={i} />
            ))}
          </div>
        ) : needsReminderList.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-8 h-8 stroke-[1.5]" />}
            title="All caught up! No follow-ups needed"
            description="All active gym member dues are settled or scheduled beyond the reminder horizon."
            className="py-12 bg-white border border-neutral-200/80 shadow-2xs"
          />
        ) : (
          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {needsReminderList.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currencySymbol={currencySymbol}
                onSelect={onSelectMember}
                onRemind={onSendReminder}
                onQuickPay={onQuickPay}
                primaryAction="remind"
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: REMINDER HISTORY (Audit Log)                                 */}
      {/* ========================================================================= */}
      <section aria-labelledby="history-heading" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <SectionHeader
            title="Reminder History"
            count={reminders.length}
            subtitle="Past dispatches"
          />

          {/* Search History */}
          <div className="w-full sm:w-60">
            <SearchInput
              value={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search history..."
            />
          </div>
        </div>

        {/* Channel Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'WHATSAPP', 'SMS', 'EMAIL'].map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannelFilter(ch)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-bold rounded-[var(--radius-full)] transition-colors cursor-pointer border',
                channelFilter === ch
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              )}
            >
              {ch === 'ALL' ? 'All Channels' : ch === 'WHATSAPP' ? 'WhatsApp' : ch}
            </button>
          ))}
        </div>

        {showLoadingReminders && reminders.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200" />
                  <div className="space-y-1.5">
                    <div className="w-28 h-3.5 bg-neutral-200 rounded" />
                    <div className="w-40 h-2.5 bg-neutral-100 rounded" />
                  </div>
                </div>
                <div className="w-14 h-4 bg-neutral-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredSentReminders.length === 0 ? (
          <EmptyState
            icon={searchQuery || channelFilter !== 'ALL' ? <Search className="w-8 h-8 stroke-[1.5]" /> : <MessageSquare className="w-8 h-8 stroke-[1.5]" />}
            title={searchQuery || channelFilter !== 'ALL' ? 'No matching reminders found' : 'No reminders sent yet'}
            description={
              searchQuery || channelFilter !== 'ALL'
                ? 'No past reminders match your search or channel filter.'
                : 'When you send payment follow-ups via WhatsApp or SMS, delivery history will appear here.'
            }
            actionLabel={searchQuery || channelFilter !== 'ALL' ? 'Clear Filters' : undefined}
            onAction={() => { setSearchQuery(''); setChannelFilter('ALL'); }}
            className="py-12 bg-white border border-neutral-200/80 shadow-2xs"
          />
        ) : (
          <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {filteredSentReminders.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
              >
                {/* Left: Member & Message Snippet */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={item.memberName || 'Member'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                        {item.memberName}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {item.memberPhone}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5 max-w-md">
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* Right: Channel, Date & Status */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="hidden sm:block text-right">
                    <div className="flex items-center gap-1 justify-end text-[11px] font-semibold text-neutral-700">
                      {getChannelIcon(item.channel)}
                      <span>{item.channel === 'WHATSAPP' ? 'WhatsApp' : item.channel}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                      {formatDate(item.sentAt, { format: 'short' })}
                    </span>
                  </div>

                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
