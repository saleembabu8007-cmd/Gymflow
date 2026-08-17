import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { Member, Payment, PAYMENT_STATUS } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useServices } from '../../services/provider';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../../utils/dateUtils';
import {
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MessageSquare,
  Clock,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  History,
  Receipt,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../utils/classNames';

import { DEFAULT_GYM_ID } from '../../data/mockData';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onQuickPay: (member: Member) => void;
  onSendReminder: (member: Member) => void;
  onEditMember?: (member: Member) => void;
  onDeleteMember?: (id: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onQuickPay,
  onSendReminder,
  onEditMember,
  onDeleteMember,
}) => {
  const { user } = useAuth();
  const { currencySymbol } = useGymSettings();
  const { payments: paymentService } = useServices();

  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch chronological payment history whenever modal opens or member changes
  useEffect(() => {
    let isMounted = true;
    if (isOpen && member) {
      setLoadingHistory(true);
      setShowDeleteConfirm(false);
      const gymIdToQuery = member.gymId || user?.gymId || '';
      paymentService
        .getPayments(gymIdToQuery, { memberId: member.id })
        .then((records) => {
          if (isMounted) {
            // Sort chronologically (newest first)
            const sorted = [...(records || [])].sort(
              (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
            );
            setPaymentHistory(sorted);
            setLoadingHistory(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setPaymentHistory([]);
            setLoadingHistory(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, member?.id, paymentService]);

  if (!member) return null;

  const diffDays = getDifferenceInDays(member.nextPaymentDate);
  const status = member.calculatedStatus || (diffDays < 0 ? PAYMENT_STATUS.OVERDUE : PAYMENT_STATUS.PAID);
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueSoon = diffDays > 0 && diffDays <= 3;
  const isPaymentPending = isOverdue || isDueToday || isDueSoon;

  const displayName = member.name || 'Member';
  const displayPhone = member.phone || 'No phone';
  const displayPlan = member.planName || 'Monthly Standard';
  const displayFee = Number(member.monthlyFee) || 0;

  const handleDelete = async () => {
    if (!onDeleteMember) return;
    try {
      setIsDeleting(true);
      await onDeleteMember(member.id);
      setIsDeleting(false);
      onClose();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="lg"
    >
      <div className="space-y-6 pb-2">
        {/* 1. HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
          {/* Member Identity */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <Avatar name={displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 truncate max-w-[220px] sm:max-w-xs">
                  {displayName}
                </h2>
                <StatusBadge status={status} size="sm" />
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap font-mono">
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                  title="Call member"
                >
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{displayPhone}</span>
                </a>
                {member.email && (
                  <span className="flex items-center gap-1 text-neutral-400 font-sans truncate max-w-[180px] sm:max-w-[220px]">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Group */}
          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60">
            {/* Remind Button */}
            <Button
              id="member-detail-btn-remind"
              variant="secondary"
              size="sm"
              onClick={() => onSendReminder(member)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5 text-neutral-600" />}
            >
              Remind
            </Button>

            {/* Mark Paid Button */}
            <Button
              id="member-detail-btn-markpaid"
              size="sm"
              onClick={() => onQuickPay(member)}
              leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-2xs"
            >
              Mark Paid
            </Button>

            {/* Edit Button */}
            {onEditMember && (
              <Button
                id="member-detail-btn-edit"
                variant="outline"
                size="sm"
                onClick={() => onEditMember(member)}
                leftIcon={<Edit2 className="w-3.5 h-3.5 text-neutral-500" />}
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* 2. PROMINENT PAYMENT STATUS SECTION */}
        <section aria-label="Payment Status" className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block px-1">
            Payment Status
          </span>

          <div
            className={cn(
              'p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs',
              isOverdue
                ? 'bg-rose-50/80 border-rose-200/90 text-rose-950'
                : isDueToday
                ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                : isDueSoon
                ? 'bg-amber-50/50 border-amber-200/70 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
            )}
          >
            {/* Left: Status message and relative timing */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isOverdue && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                {isDueToday && <Clock className="w-5 h-5 text-amber-600 shrink-0" />}
                {isDueSoon && <Clock className="w-5 h-5 text-amber-600 shrink-0" />}
                {!isPaymentPending && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}

                <span className="text-xs font-bold uppercase tracking-wider">
                  {isOverdue
                    ? 'OVERDUE'
                    : isDueToday
                    ? 'DUE TODAY'
                    : isDueSoon
                    ? 'DUE SOON'
                    : 'UP TO DATE'}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium opacity-85 pl-7">
                {isOverdue
                  ? `Due ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago (${formatDate(member.nextPaymentDate, { format: 'medium' })})`
                  : isDueToday
                  ? 'Payment is due today'
                  : isDueSoon
                  ? `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'} (${formatDate(member.nextPaymentDate, { format: 'medium' })})`
                  : `Next renewal due on ${formatDate(member.nextPaymentDate, { format: 'medium' })}`}
              </p>
            </div>

            {/* Right: Prominent Amount & Quick action */}
            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 shrink-0 pl-7 sm:pl-0">
              <div className="text-left sm:text-right">
                <span className="text-xl sm:text-2xl font-bold tracking-tight block">
                  {formatCurrency(displayFee, currencySymbol)}
                </span>
                <span className="text-[10px] opacity-70 uppercase font-semibold">
                  Renewal Amount
                </span>
              </div>

              {isPaymentPending && (
                <Button
                  size="sm"
                  onClick={() => onQuickPay(member)}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs px-3"
                >
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* 3. NEXT PAYMENT & MEMBERSHIP INFO */}
        <section aria-label="Membership Details" className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block px-1">
            Membership & Schedule
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Membership Plan */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-neutral-400" />
                Plan
              </span>
              <span className="font-bold text-sm text-neutral-900 block truncate">
                {displayPlan}
              </span>
              <span className="text-[11px] text-neutral-500">
                {member.durationMonths || 1} {(member.durationMonths || 1) === 1 ? 'Month cycle' : 'Months cycle'}
              </span>
            </div>

            {/* Start Date */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                Start Date
              </span>
              <span className="font-bold text-sm text-neutral-900 block">
                {formatDate(member.startDate, { format: 'medium' })}
              </span>
              <span className="text-[11px] text-neutral-500">
                Member status: {member.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Next Payment Date */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                Next Payment
              </span>
              <span
                className={cn(
                  'font-bold text-sm block',
                  isOverdue ? 'text-rose-600' : 'text-neutral-900'
                )}
              >
                {formatDate(member.nextPaymentDate, { format: 'medium' })}
              </span>
              <span className="text-[11px] text-neutral-500">
                {formatCurrency(displayFee, currencySymbol)} per cycle
              </span>
            </div>
          </div>

          {member.notes && (
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-xs mt-2">
              <span className="font-bold text-neutral-700 block mb-0.5">Notes</span>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}
        </section>

        {/* 4. PAYMENT HISTORY */}
        <section aria-label="Payment History" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Payment History
            </span>
            {paymentHistory.length > 0 && (
              <span className="text-xs text-neutral-400">
                {paymentHistory.length} {paymentHistory.length === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>

          {loadingHistory ? (
            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 text-center text-xs text-neutral-400 shadow-2xs">
              Loading payment history...
            </div>
          ) : paymentHistory.length === 0 ? (
            /* Empty State */
            <div className="p-8 rounded-2xl bg-white border border-neutral-200/80 text-center shadow-2xs flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-2.5">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">
                No payments recorded yet.
              </h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                When you record payments for {displayName}, they will appear here chronologically.
              </p>
            </div>
          ) : (
            /* Chronological History List with Scroll Safety for Long Histories */
            <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden max-h-72 overflow-y-auto">
              {paymentHistory.map((item) => {
                const itemAmt = Number(item.amount) || 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
                  >
                    {/* Left: Date & Method */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs sm:text-sm text-neutral-900 block">
                          {formatDate(item.paymentDate, { format: 'medium' })}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 flex-wrap">
                          <span className="font-medium text-neutral-700">
                            {item.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : item.paymentMethod || 'Cash'}
                          </span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="text-neutral-400 truncate max-w-[140px] sm:max-w-[200px]">
                                {item.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status Badge */}
                    <div className="flex items-center gap-2.5 text-right shrink-0">
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-emerald-700 block">
                          +{formatCurrency(itemAmt, currencySymbol)}
                        </span>
                        <span className="text-[10px] text-neutral-400">Received</span>
                      </div>

                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        Paid
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. SECONDARY / DANGER AREA (Archive Member) */}
        {onDeleteMember && (
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            {showDeleteConfirm ? (
              <div className="w-full p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-rose-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Archive <strong>{displayName}</strong>? Past payment history will be preserved.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                  >
                    Archive Member
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                id="btn-show-delete-member"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-neutral-400 hover:text-rose-600 transition-colors flex items-center gap-1 py-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive member</span>
              </button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
