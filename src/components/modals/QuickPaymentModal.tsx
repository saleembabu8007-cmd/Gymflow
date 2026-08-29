import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Avatar } from '../ui/Avatar';
import { TwoTierNumber } from '../ui/TwoTierNumber';
import { Member, PaymentMethod } from '../../types';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useToast } from '../ui/Toast';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatToISODate, formatDate } from '../../utils/dateUtils';
import { computeNextPaymentRenewalDate } from '../../lib/domain/paymentDomain';
import { parseAppError } from '../../utils/errorUtils';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Receipt,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../utils/classNames';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onPaymentRecorded?: (result: { member: Member; payment: any }) => void;
  onMarkAsPaidSubmit: (
    memberId: string,
    details: {
      amount: number;
      method: PaymentMethod;
      paymentDate?: string;
      notes?: string;
      durationMonths?: number;
      recordedBy?: string;
    }
  ) => Promise<any>;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'UPI', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'CASH', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <Building2 className="w-4 h-4" /> },
  { id: 'OTHER', label: 'Other', icon: <MoreHorizontal className="w-4 h-4" /> },
];

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  onClose,
  member,
  onPaymentRecorded,
  onMarkAsPaidSubmit,
}) => {
  const { currencySymbol } = useGymSettings();
  const { success, error: showErrorToast } = useToast();

  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(formatToISODate(new Date()));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize and reset defaults when modal opens
  useEffect(() => {
    if (member && isOpen) {
      setAmount(String(member.monthlyFee || 1500));
      setPaymentDate(formatToISODate(new Date()));
      setPaymentMethod('UPI');
      setDurationMonths(member.durationMonths || 1);
      setNotes('');
      setErrorMessage(null);
    }
  }, [member, isOpen]);

  if (!member) return null;

  // Live calculation of resulting next due date
  const calculatedNextDueDate = computeNextPaymentRenewalDate(
    member.nextPaymentDate,
    paymentDate || formatToISODate(new Date()),
    durationMonths
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      showErrorToast("Invalid amount", 'Please enter a valid payment amount greater than zero.');
      return;
    }

    if (!paymentDate) {
      showErrorToast("Invalid date", 'Please select a valid payment date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await onMarkAsPaidSubmit(member.id, {
        amount: numericAmount,
        method: paymentMethod,
        paymentDate,
        durationMonths,
        notes: notes.trim() || undefined,
        recordedBy: 'Gym Owner',
      });

      success('Payment recorded.', `${formatCurrency(numericAmount, currencySymbol)} received from ${member.name}`);

      if (onPaymentRecorded) {
        onPaymentRecorded(result);
      }

      onClose();
    } catch (err: any) {
      const userFriendlyError = parseAppError(err, "Couldn't save the payment. Please try again.");
      setErrorMessage(userFriendlyError);
      showErrorToast("Couldn't save payment", userFriendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      description={`Record collection receipt for ${member.name}`}
      maxWidth="md"
      showCloseButton={!isSubmitting}
    >
      <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-5 select-none font-sans">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-900)] flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-[var(--color-danger-600)] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Member Context Snapshot */}
        <div className="p-3.5 rounded-[var(--radius-lg)] bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={member.name} size="sm" />
            <div className="min-w-0">
              <span className="font-bold text-sm text-neutral-900 block truncate">
                {member.name}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {member.phone} · {member.planName || 'Standard'}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <TwoTierNumber
              value={formatCurrency(Number(member.monthlyFee) || 0, currencySymbol)}
              caption="Standard Fee"
              size="xs"
              align="right"
            />
          </div>
        </div>

        {/* Amount & Date Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Amount Received"
            required
            type="number"
            prefixText={currencySymbol}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1500"
            autoFocus
          />

          <Input
            label="Payment Date"
            required
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 block">
            Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 p-2.5 rounded-[var(--radius-md)] text-xs font-bold border transition-colors cursor-pointer',
                  paymentMethod === m.id
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                )}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview: Resulting Next Due Date */}
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-success-50)] border border-[var(--color-success-200)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[var(--color-success-900)]">
            <Clock className="w-3.5 h-3.5 text-[var(--color-success-700)] shrink-0" />
            <span className="font-semibold">Next renewal due:</span>
          </div>
          <span className="font-bold text-[var(--color-success-900)] font-mono">
            {formatDate(calculatedNextDueDate, { format: 'medium' })}
          </span>
        </div>

        {/* Optional Notes */}
        <Textarea
          label="Transaction Notes"
          placeholder="Receipt #, transaction ref, or notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200/80">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={<Receipt className="w-4 h-4" />}
          >
            Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
