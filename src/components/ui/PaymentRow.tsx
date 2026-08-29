import React from 'react';
import { Payment } from '../../types';
import { Avatar } from './Avatar';
import { TwoTierNumber } from './TwoTierNumber';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import { CreditCard, FileText, Smartphone, Banknote } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface PaymentRowProps {
  payment: Payment;
  currencySymbol?: string;
  onViewReceipt?: (payment: Payment) => void;
  className?: string;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  currencySymbol = '₹',
  onViewReceipt,
  className,
}) => {
  const memberName = payment.memberName || 'Member';
  const amount = Number(payment.amount) || 0;
  const paymentMethod = payment.paymentMethod || 'CASH';
  const paymentDate = payment.paymentDate ? formatDate(payment.paymentDate) : 'Today';

  const getMethodIcon = () => {
    switch (paymentMethod.toUpperCase()) {
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
    <div
      className={cn(
        'group flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-neutral-50/80 transition-colors border-b border-neutral-100 last:border-0 select-none',
        className
      )}
    >
      {/* Left: Avatar & Member Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={memberName} size="sm" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-900 truncate">
            {memberName}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
            <span>{paymentDate}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-mono uppercase text-[11px]">
              {getMethodIcon()}
              {paymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Two-Tier Amount + Receipt Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <TwoTierNumber
            value={formatCurrency(amount, currencySymbol)}
            caption={payment.periodCovered || 'Paid'}
            size="sm"
            align="right"
          />
        </div>

        {onViewReceipt && (
          <button
            type="button"
            onClick={() => onViewReceipt(payment)}
            aria-label="View Receipt"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
