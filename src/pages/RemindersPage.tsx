import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton, SkeletonText, MemberRowSkeleton } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { FilterChips } from '../components/ui/FilterChips';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { MemberRow } from '../components/ui/MemberRow';
import { ListSection } from '../components/ui/ListSection';
import { Member, Reminder, ReminderChannel, ReminderStatus } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useReminders } from '../hooks/useReminders';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { useGymSettings } from '../hooks/useGymSettings';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../utils/dateUtils';
import {
  MessageSquare,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
  CreditCard,
  Send,
  RotateCcw,
  Sparkles,
  ChevronRight,
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
  const { members, loading: loadingMembers, error: membersError } = useMembers();
  const { reminders, loading: loadingReminders, error: remindersError, sendReminder } = useReminders();
  const showLoadingMembers = useDelayedLoading(loadingMembers, 400);
  const showLoadingReminders = useDelayedLoading(loadingReminders, 400);
  const error = membersError || remindersError;
  const { currencySymbol } = useGymSettings();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // 1. Compute members who need reminders (overdue or due today or due within 3 days)
  const needsReminderList = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== 'ACTIVE') return false;
        const diff = getDifferenceInDays(m.nextPaymentDate);
        return diff <= 3; // Overdue, due today, or due in next 3 days
      })
      .sort((a, b) => {
        const diffA = getDifferenceInDays(a.nextPaymentDate);
        const diffB = getDifferenceInDays(b.nextPaymentDate);
        return diffA - diffB; // Most urgent first
      });
  }, [members]);

  // Lookup map to see when member was last reminded
  const memberLastRemindedMap = useMemo(() => {
    const map = new Map<string, Reminder>();
    // reminders is ordered newest first
    reminders.forEach((r) => {
      if (!map.has(r.memberId)) {
        map.set(r.memberId, r);
      }
    });
    return map;
  }, [reminders]);

  // 2. Filter sent reminders by search and channel
  const filteredSentReminders = useMemo(() => {
    return reminders.filter((r) => {
      if (channelFilter !== 'ALL' && r.channel !== channelFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.memberName.toLowerCase().includes(q);
        const matchesPhone = r.memberPhone.includes(q);
        const matchesMessage = r.message.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesMessage;
      }
      return true;
    });
  }, [reminders, channelFilter, searchQuery]);

  const getChannelBadge = (channel: ReminderChannel) => {
    switch (channel) {
      case 'WHATSAPP':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            <span>WhatsApp</span>
          </span>
        );
      case 'SMS':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-sky-600" />
            <span>SMS</span>
          </span>
        );
      case 'EMAIL':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center gap-1">
            <Mail className="w-3 h-3 text-purple-600" />
            <span>Email</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-600">
            {channel}
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed Sent
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            WhatsApp Opened
          </span>
        );
    }
  };

  const handleMemberClick = (member: Member) => {
    if (onSelectMember) {
      onSelectMember(member);
    }
  };
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <ErrorState
          title="Couldn't load reminders"
          message="We couldn't retrieve your reminders. Please check your connection and try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3.5">
        {showLoadingMembers ? (
          <div className="flex flex-col gap-2 mt-4">
            {[1, 2, 3].map(i => <MemberRowSkeleton key={i} />)}
          </div>
        ) : needsReminderList.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="pt-8"
          >
            <EmptyState
              icon={<CheckCircle2 />}
              title="No pending reminders"
              description="All member dues are settled or scheduled beyond the reminder window."
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <ListSection
              title="Needs Reminder"
            count={needsReminderList.length}
            badgeVariant="danger"
            subtitle="Overdue and approaching dues"
          >
            {needsReminderList.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currencySymbol={currencySymbol}
                onSelect={handleMemberClick}
                onQuickPay={onQuickPay}
                onRemind={onSendReminder}
                primaryAction="remind"
              />
            ))}
            </ListSection>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: RECENTLY SENT                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Recently Sent
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
              {reminders.length}
            </span>
          </div>

          {/* Search History */}
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search reminder history..."
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Minimal Channel Filters */}
        <div className="pt-2 pb-1">
          <SegmentedControl
            options={[
              { value: 'ALL', label: 'All Channels' },
              { value: 'WHATSAPP', label: 'WhatsApp' },
              { value: 'SMS', label: 'SMS' },
              { value: 'EMAIL', label: 'Email' },
            ]}
            value={channelFilter}
            onChange={(id) => setChannelFilter(id)}
          />
        </div>

        {showLoadingReminders ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map(i => <MemberRowSkeleton key={i} />)}
          </div>
        ) : filteredSentReminders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="pt-8"
          >
            <EmptyState
              icon={<MessageSquare />}
              title="All caught up!"
              description="When you remind members about upcoming or overdue payments, delivery history will appear here."
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <ListSection
              title={channelFilter === 'ALL' ? 'All Channels' : channelFilter}
            count={filteredSentReminders.length}
            badgeVariant="neutral"
          >
            {filteredSentReminders.map((r) => {
              const member = members.find((m) => m.id === r.memberId);
              if (!member) return null;
              
              return (
                <MemberRow
                  key={r.id}
                  member={member}
                  currencySymbol={currencySymbol}
                  onSelect={handleMemberClick}
                  onQuickPay={onQuickPay}
                  onRemind={onSendReminder}
                  primaryAction="remind"
                />
              );
            })}
            </ListSection>
          </motion.div>
        )}
      </div>
    </div>
  );
};
