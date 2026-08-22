import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { Avatar } from '../components/ui/Avatar';
import { FilterChips } from '../components/ui/FilterChips';
import { MemberRow } from '../components/ui/MemberRow';
import { Member, Reminder, ReminderChannel, ReminderStatus } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useReminders } from '../hooks/useReminders';
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
      {/* Page Header */}
      <PageHeader
        title="Reminders"
        subtitle="Prompt due members with friendly payment notices and review dispatch history"
      />

      {/* ========================================================================= */}
      {/* SECTION 1: NEEDS REMINDER                                                */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Needs Reminder
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-100 text-rose-800">
              {needsReminderList.length}
            </span>
          </div>
          <span className="text-xs text-zinc-500 hidden sm:inline-block">
            Overdue and approaching dues
          </span>
        </div>

        {loadingMembers ? (
          <LoadingState message="Checking members needing reminders..." />
        ) : needsReminderList.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-950">No pending reminders.</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              All member dues are settled or scheduled beyond the reminder window.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
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
          </div>
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
          <FilterChips
            options={[
              { id: 'ALL', label: 'All Channels' },
              { id: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> },
              { id: 'SMS', label: 'SMS', icon: <Smartphone className="w-3.5 h-3.5 text-sky-500" /> },
              { id: 'EMAIL', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-slate-500" /> },
            ]}
            activeId={channelFilter}
            onChange={(id) => setChannelFilter(id)}
          />
        </div>

        {loadingReminders ? (
          <LoadingState message="Loading reminder dispatches..." />
        ) : filteredSentReminders.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-1 border-4 border-teal-50/50">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">All caught up!</h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              When you remind members about upcoming or overdue payments, delivery history will appear here.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={channelFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="divide-y divide-zinc-100"
            >
              {filteredSentReminders.map((r) => (
                <div
                  key={r.id}
                  id={`reminder-history-row-${r.id}`}
                  className="py-4 hover:bg-zinc-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 -mx-4 px-4 group"
                >
                  {/* Left: Member info, channel badge, status badge, message */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0 border border-zinc-200/60 mt-0.5">
                      {r.channel === 'WHATSAPP' ? (
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      ) : r.channel === 'SMS' ? (
                        <Smartphone className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Mail className="w-4 h-4 text-purple-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-zinc-950">
                          {r.memberName}
                        </span>
                        {getChannelBadge(r.channel)}
                        {getStatusBadge(r.status)}
                      </div>

                      {/* Message Preview */}
                      <div className="mt-1.5 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs text-zinc-700 leading-relaxed font-sans">
                        "{r.message}"
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2 flex-wrap font-mono">
                        <span>{r.memberPhone}</span>
                        <span className="font-sans text-zinc-300">•</span>
                        <span className="font-sans text-zinc-600">
                          Amount: {formatCurrency(r.amount, currencySymbol)}
                        </span>
                        <span className="font-sans text-zinc-300">•</span>
                        <span className="font-sans text-zinc-600">
                          Due: {formatDate(r.dueDate, { format: 'medium' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp & Quick Action */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 shrink-0">
                    <span className="text-[11px] font-medium text-zinc-400">
                      {formatDate(r.sentAt, { format: 'relative' })}
                    </span>

                    {onSendReminder && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = members.find((m) => m.id === r.memberId);
                          if (target) {
                            onSendReminder(target);
                          } else {
                            // Resend generic
                            sendReminder({
                              memberId: r.memberId,
                              channel: r.channel,
                              message: r.message,
                              amount: r.amount,
                              dueDate: r.dueDate,
                            });
                          }
                        }}
                        className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] min-w-[44px] px-3 py-1 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600 focus:outline-none"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Resend</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
