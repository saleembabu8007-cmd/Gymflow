import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { TwoTierNumber } from '../ui/TwoTierNumber';
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
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
  AlertTriangle,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { cn } from '../../utils/classNames';

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
  }, [isOpen, member?.id, paymentService, user?.gymId]);

  if (!member) return null;

  const diffDays = getDifferenceInDays(member.nextPaymentDate);
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueSoon = diffDays > 0 && diffDays <= 3;
  const isPending = isOverdue || isDueToday || isDueSoon;

  const displayName = member.name || 'Member';
  const displayPhone = member.phone || 'No phone';
  const displayPlan = member.planName || 'Standard Plan';
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

  const getMethodIcon = (method: string) => {
    switch ((method || '').toUpperCase()) {
      case 'UPI':
        return <Smartphone className="w-3 h-3" />;
      case 'CARD':
        return <CreditCard className="w-3 h-3" />;
      case 'CASH':
      default:
        return <Banknote className="w-3 h-3" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={true}>
      <div className="space-y-6 p-5 sm:p-6 select-none font-sans">
        {/* 1. MEMBER IDENTITY & PRIMARY ACTIONS HERO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
          {/* Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar name={displayName} size="lg" status={isOverdue ? 'overdue' : 'active'} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 truncate font-display">
                  {displayName}
                </h2>
                <StatusBadge 
                  status={isOverdue ? 'OVERDUE' : isDueToday ? 'DUE_TODAY' : isDueSoon ? 'DUE_SOON' : 'PAID'} 
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap font-mono">
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{displayPhone}</span>
                </a>
                {member.email && (
                  <span className="flex items-center gap-1 text-neutral-400 font-sans truncate max-w-[200px]">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
            <Button
              id="member-detail-btn-remind"
              variant="secondary"
              size="sm"
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => onSendReminder(member)}
            >
              Remind
            </Button>

            <Button
              id="member-detail-btn-markpaid"
              variant="primary"
              size="sm"
              leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              onClick={() => onQuickPay(member)}
            >
              Record Payment
            </Button>

            {onEditMember && (
              <Button
                id="member-detail-btn-edit"
                variant="ghost"
                size="sm"
                onClick={() => onEditMember(member)}
                aria-label="Edit Member"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* 2. MEMBERSHIP & PAYMENT SCHEDULE SUMMARY */}
        <section aria-label="Membership Details" className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block px-0.5">
            Membership Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Plan */}
            <div className="p-3.5 rounded-[var(--radius-lg)] bg-neutral-50/70 border border-neutral-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-neutral-400" />
                Plan
              </span>
              <span className="font-bold text-sm text-neutral-900 block truncate">
                {displayPlan}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {member.durationMonths || 1} {(member.durationMonths || 1) === 1 ? 'month cycle' : 'months cycle'}
              </span>
            </div>

            {/* Next Due Date */}
            <div className="p-3.5 rounded-[var(--radius-lg)] bg-neutral-50/70 border border-neutral-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                Next Renewal
              </span>
              <span
                className={cn(
                  'font-bold text-sm block font-mono',
                  isOverdue ? 'text-[var(--color-danger-600)]' : 'text-neutral-900'
                )}
              >
                {formatDate(member.nextPaymentDate, { format: 'medium' })}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {isOverdue
                  ? `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`
                  : isDueToday
                  ? 'Due today'
                  : `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`}
              </span>
            </div>

            {/* Fee */}
            <div className="p-3.5 rounded-[var(--radius-lg)] bg-neutral-50/70 border border-neutral-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-neutral-400" />
                Fee Amount
              </span>
              <div className="pt-0.5">
                <TwoTierNumber
                  value={formatCurrency(displayFee, currencySymbol)}
                  caption="/cycle"
                  size="sm"
                />
              </div>
              <span className="text-[11px] text-neutral-500">
                Started {formatDate(member.startDate, { format: 'short' })}
              </span>
            </div>
          </div>

          {member.notes && (
            <div className="p-3 rounded-[var(--radius-md)] bg-neutral-50 border border-neutral-200/60 text-xs mt-2">
              <span className="font-semibold text-neutral-700 block mb-0.5">Notes:</span>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}
        </section>

        {/* 3. CHRONOLOGICAL PAYMENT HISTORY */}
        <section aria-label="Payment History" className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Payment History
            </span>
            {paymentHistory.length > 0 && (
              <span className="text-xs text-neutral-500 font-medium">
                {paymentHistory.length} {paymentHistory.length === 1 ? 'payment' : 'payments'} recorded
              </span>
            )}
          </div>

          {loadingHistory ? (
            <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-50/50 rounded-[var(--radius-lg)] border border-neutral-200/80">
              Loading payment history...
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="p-8 rounded-[var(--radius-lg)] bg-neutral-50/50 border border-neutral-200/80 text-center flex flex-col items-center justify-center">
              <Receipt className="w-6 h-6 text-neutral-400 mb-2 stroke-[1.5]" />
              <h4 className="text-sm font-bold text-neutral-900">No payment receipts yet</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                When you record payments for {displayName}, receipts will appear here chronologically.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] divide-y divide-neutral-100 overflow-hidden max-h-60 overflow-y-auto shadow-2xs">
              {paymentHistory.map((item) => {
                const itemAmt = Number(item.amount) || 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
                  >
                    {/* Date & Method */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                        {getMethodIcon(item.paymentMethod)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs sm:text-sm text-neutral-900 block truncate">
                          {formatDate(item.paymentDate, { format: 'medium' })}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                          <span className="font-medium uppercase font-mono text-[10px]">
                            {item.paymentMethod || 'CASH'}
                          </span>
                          {item.notes && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[150px]">{item.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <TwoTierNumber
                        value={`+${formatCurrency(itemAmt, currencySymbol)}`}
                        caption="Received"
                        size="xs"
                        align="right"
                        valueClassName="text-[var(--color-success-700)] font-mono"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. FOOTER / ARCHIVE ACTION */}
        <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between gap-3">
          {showDeleteConfirm ? (
            <div className="w-full p-3 rounded-[var(--radius-md)] bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[var(--color-danger-900)] text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-[var(--color-danger-600)] shrink-0" />
                <span>Archive <strong>{displayName}</strong>? Payment history will remain preserved.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
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
                  Archive
                </Button>
              </div>
            </div>
          ) : (
            <>
              {onDeleteMember && (
                <button
                  type="button"
                  id="btn-show-delete-member"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-neutral-400 hover:text-[var(--color-danger-600)] transition-colors flex items-center gap-1 py-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Archive member</span>
                </button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="ml-auto"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
