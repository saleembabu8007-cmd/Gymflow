import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { Avatar } from '../components/ui/Avatar';
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
  const { members, loading: loadingMembers } = useMembers();
  const { reminders, loading: loadingReminders, sendReminder } = useReminders();
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
          <div className="flex flex-col gap-0 border-y border-zinc-100">
            {needsReminderList.map((member) => {
              const diffDays = getDifferenceInDays(member.nextPaymentDate);
              const isOverdue = diffDays < 0;
              const isToday = diffDays === 0;
              const overdueDaysCount = Math.abs(diffDays);
              const lastReminder = memberLastRemindedMap.get(member.id);

              return (
                <div
                  key={member.id}
                  id={`reminder-needed-card-${member.id}`}
                  className={cn(
                    'py-5 border-b border-zinc-100 transition-colors flex flex-col justify-between gap-3.5 -mx-4 px-4 group',
                    isOverdue
                      ? 'hover:bg-rose-50/30'
                      : isToday
                      ? 'hover:bg-amber-50/30'
                      : 'hover:bg-zinc-50/50',
                    'last:border-b-0'
                  )}
                >
                  {/* Top: Member Info & Due Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={member.name} size="md" />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => handleMemberClick(member)}
                          className="font-bold text-sm text-zinc-950 hover:underline text-left truncate block cursor-pointer group-hover:text-zinc-700 transition-colors"
                        >
                          {member.name}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-bold text-zinc-950 block">
                        {formatCurrency(member.monthlyFee, currencySymbol)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-medium">
                        {member.planName}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Urgency & Last Reminded Status */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-zinc-100">
                    <div>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Overdue · {overdueDaysCount}d
                        </span>
                      ) : isToday ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Due today
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400 font-medium">
                      {lastReminder ? (
                        <span className="text-zinc-500">
                          Reminded {formatDate(lastReminder.sentAt, { format: 'relative' })}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Not reminded yet</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {onQuickPay && (
                      <Button
                        id={`btn-reminders-pay-${member.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => onQuickPay(member)}
                        className="text-xs px-3 font-medium text-zinc-700"
                      >
                        Mark Paid
                      </Button>
                    )}

                    {onSendReminder && (
                      <Button
                        id={`btn-reminders-remind-${member.id}`}
                        size="sm"
                        onClick={() => onSendReminder(member)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-3.5 font-semibold"
                      >
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Channels' },
            { id: 'WHATSAPP', label: 'WhatsApp' },
            { id: 'SMS', label: 'SMS' },
            { id: 'EMAIL', label: 'Email' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              id={`filter-reminders-${item.id.toLowerCase()}`}
              onClick={() => setChannelFilter(item.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer',
                channelFilter === item.id
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loadingReminders ? (
          <LoadingState message="Loading reminder dispatches..." />
        ) : filteredSentReminders.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-950">No reminders recorded yet.</h3>
            <p className="text-xs text-zinc-500 mt-0.5 max-w-sm">
              When you remind members about upcoming or overdue payments, delivery history will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
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
                      className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-zinc-400" />
                      <span>Resend</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
