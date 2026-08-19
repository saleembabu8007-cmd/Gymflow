import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { Member, PaymentMethod } from '../../types';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useToast } from '../ui/Toast';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatToISODate, formatDate } from '../../utils/dateUtils';
import { computeNextPaymentRenewalDate } from '../../lib/domain/paymentDomain';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
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

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'CASH', label: 'Cash', icon: Banknote },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
  { id: 'OTHER', label: 'Other', icon: MoreHorizontal },
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

  // Initialize and reset defaults when modal opens or member changes
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

  // Centralized next payment calculation preview
  const calculatedNextDueDate = computeNextPaymentRenewalDate(
    member.nextPaymentDate,
    paymentDate || formatToISODate(new Date()),
    durationMonths
  );

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      showErrorToast("Couldn't save the payment. Please try again.", 'Please enter a valid payment amount.');
      return;
    }

    if (!paymentDate) {
      showErrorToast("Couldn't save the payment. Please try again.", 'Please select a valid payment date.');
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

      // Show lightweight success toast: "Payment recorded."
      success('Payment recorded.', `${formatCurrency(numericAmount, currencySymbol)} received from ${member.name}`);

      if (onPaymentRecorded) {
        onPaymentRecorded(result);
      }

      // Close modal and keep owner in context
      onClose();
    } catch (err: any) {
      // Parse specific error message from Supabase RPC / network error
      const rawMessage = typeof err === 'string' ? err : err?.message || err?.details || '';
      const userFriendlyError = rawMessage && typeof rawMessage === 'string' && rawMessage.trim().length > 0 && !rawMessage.includes('[object')
        ? rawMessage
        : "Couldn't save the payment. Please check your connection and try again.";
      setErrorMessage(userFriendlyError);
      showErrorToast("Couldn't save the payment.", userFriendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      description={`Record payment for ${member.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Error notification banner with retry */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFormSubmit()}
              disabled={isSubmitting}
              className="text-xs shrink-0 bg-white hover:bg-rose-100/50 text-rose-900 border-rose-200"
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Member Context Summary */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={member.name} size="sm" />
            <div className="min-w-0">
              <span className="font-bold text-neutral-950 block text-sm truncate">
                {member.name}
              </span>
              <span className="text-neutral-500 font-mono">{member.phone}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Current Plan
            </span>
            <span className="font-semibold text-neutral-800 text-xs">
              {member.planName}
            </span>
          </div>
        </div>

        {/* Amount & Payment Date (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="payment-amount-input"
            label={`Amount (${currencySymbol}) *`}
            type="number"
            min="1"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            prefixText={currencySymbol}
            required
            autoFocus
          />

          <Input
            id="payment-date-input"
            label="Payment date *"
            type="date"
            value={paymentDate}
            onChange={(e) => {
              setPaymentDate(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            required
          />
        </div>

        {/* Payment Method Quick Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 block">
            Payment method *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((item) => {
              const Icon = item.icon;
              const isSelected = paymentMethod === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`btn-method-${item.id.toLowerCase()}`}
                  onClick={() => setPaymentMethod(item.id)}
                  className={cn(
                    'h-11 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer',
                    isSelected
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs ring-2 ring-neutral-950/10'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-neutral-500')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Extension Duration & Scheduled Next Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="payment-duration-select"
            label="Membership renewal extension"
            value={durationMonths}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDurationMonths(val);
              // Pro-rate or update amount if standard multiple
              const basePlanMonths = member.durationMonths || 1;
              const baseRate = member.monthlyFee || 1500;
              setAmount(String(Math.round((baseRate / basePlanMonths) * val)));
            }}
            options={[
              { value: 1, label: '1 Month (+30 days)' },
              { value: 2, label: '2 Months (+60 days)' },
              { value: 3, label: '3 Months (Quarterly)' },
              { value: 6, label: '6 Months (Half-Yearly)' },
              { value: 12, label: '12 Months (Annual)' },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Next payment due date
            </label>
            <div className="h-10 px-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs font-semibold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {formatDate(calculatedNextDueDate, { format: 'medium' })}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700">
                Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Optional Note */}
        <Input
          id="payment-notes-input"
          label="Optional note"
          placeholder="e.g. UPI Ref #482910, received by counter staff"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          helperText="Transaction reference or custom remarks"
        />

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            id="btn-submit-mark-paid"
            type="submit"
            size="md"
            isLoading={isSubmitting}
            className="bg-neutral-900 text-white hover:bg-neutral-800 font-semibold px-6"
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving payment...' : 'Mark as Paid'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
