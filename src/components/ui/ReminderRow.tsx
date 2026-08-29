import React from 'react';
import { Member } from '../../types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { TwoTierNumber } from './TwoTierNumber';
import { formatCurrency } from '../../utils/currencyUtils';
import { getDifferenceInDays } from '../../utils/dateUtils';
import { MessageSquare, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface ReminderRowProps {
  member: Member;
  currencySymbol?: string;
  onRemind: (member: Member) => void;
  onQuickPay?: (member: Member) => void;
  className?: string;
}

export const ReminderRow: React.FC<ReminderRowProps> = ({
  member,
  currencySymbol = '₹',
  onRemind,
  onQuickPay,
  className,
}) => {
  const diffDays = getDifferenceInDays(member.nextPaymentDate);
  const isOverdue = diffDays < 0;
  const days = Math.abs(diffDays);
  const displayName = member.name || 'Member';
  const displayFee = Number(member.monthlyFee) || 0;

  return (
    <div
      className={cn(
        'group flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-neutral-50/80 transition-colors border-b border-neutral-100 last:border-0 select-none',
        className
      )}
    >
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={displayName} size="sm" status={isOverdue ? 'overdue' : 'active'} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-900 truncate">
            {displayName}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
            <span className="font-mono text-[11px]">{member.phone}</span>
            <span>·</span>
            {isOverdue ? (
              <span className="text-[var(--color-danger-600)] font-medium">
                {days}d overdue
              </span>
            ) : (
              <span className="text-[var(--color-warning-600)] font-medium">
                Due in {diffDays}d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Fee + Primary Action Pill */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <TwoTierNumber
            value={formatCurrency(displayFee, currencySymbol)}
            caption="/month"
            size="sm"
            align="right"
          />
        </div>

        <button
          type="button"
          onClick={() => onRemind(member)}
          className="relative inline-flex items-center justify-center h-8 px-3 gap-1.5 rounded-full text-xs font-semibold bg-[var(--color-brand-500)] text-neutral-950 hover:bg-[var(--color-brand-400)] active:bg-[var(--color-brand-600)] shadow-2xs transition-all cursor-pointer before:absolute before:-inset-1.5 before:content-[''] sm:before:hidden"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Remind</span>
        </button>

        {onQuickPay && (
          <button
            type="button"
            onClick={() => onQuickPay(member)}
            title="Mark as Paid"
            aria-label="Mark as Paid"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-[var(--color-success-600)] hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
