import React, { useState } from 'react';
import { Member } from '../../types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { ListRow } from './ListRow';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../../utils/dateUtils';
import { CheckCircle2, MessageSquare, MoreHorizontal, Calendar, User } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface MemberRowProps {
  member: Member;
  currencySymbol: string;
  onSelect?: (member: Member) => void;
  onRemind?: (member: Member) => void;
  onQuickPay?: (member: Member) => void;
  className?: string;
  highlighted?: boolean;
  primaryAction?: 'remind' | 'pay';
}

export const MemberRow: React.FC<MemberRowProps> = ({
  member,
  currencySymbol,
  onSelect,
  onRemind,
  onQuickPay,
  className,
  highlighted,
  primaryAction = 'pay',
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isSuccessFlash, setIsSuccessFlash] = useState(false);

  const diffDays = getDifferenceInDays(member.nextPaymentDate);
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isPending = diffDays <= 0;

  const displayName = member.name || 'Member';
  const displayFee = Number(member.monthlyFee) || 0;
  const displayPlan = member.planName || 'Standard';

  const renderStatus = () => {
    if (isSuccessFlash) {
      return (
        <Badge variant="success" treatment="default">
          Paid
        </Badge>
      );
    }

    if (isOverdue) {
      const days = Math.abs(diffDays);
      return (
        <div className="flex items-center gap-1.5">
          <Badge variant="danger" treatment="emphasis">
            Overdue
          </Badge>
          <span className="text-[11px] text-neutral-500 font-medium">by {days} {days === 1 ? 'day' : 'days'}</span>
        </div>
      );
    }
    if (isDueToday) {
      return (
        <Badge variant="warning" treatment="emphasis">
          Due today
        </Badge>
      );
    }
    if (diffDays <= 3) {
      return (
        <div className="flex items-center gap-1.5">
          <Badge variant="warning" treatment="default">
            Due soon
          </Badge>
          <span className="text-[11px] text-neutral-500 font-medium">in {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
        </div>
      );
    }
    return (
      <Badge variant="success" treatment="default">
        Paid up
      </Badge>
    );
  };

  // Status & Metadata (at most 2 inline metadata pills: plan badge + status badge)
  const metadataBadges = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge variant="neutral" treatment="default">
        {displayPlan}
      </Badge>
      {renderStatus()}
    </div>
  );

  const actionsNode = (
    <div className="relative flex items-center gap-1.5">
      {isPending ? (
        <>
          {/* Exactly ONE primary pill-shaped action button with >=44px touch target */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (primaryAction === 'pay') {
                setIsSuccessFlash(true);
                setTimeout(() => onQuickPay?.(member), 800);
              } else {
                onRemind?.(member);
              }
            }}
            className={cn(
              "relative inline-flex items-center justify-center gap-1.5 h-8 px-3.5 sm:px-4 rounded-full font-bold text-xs transition-all shadow-2xs cursor-pointer select-none shrink-0",
              "before:absolute before:-inset-1.5 before:content-[''] before:pointer-events-auto sm:before:hidden",
              primaryAction === 'pay'
                ? "bg-[var(--color-brand-500)] text-neutral-950 hover:bg-[var(--color-brand-400)] active:bg-[var(--color-brand-600)]"
                : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300"
            )}
          >
            {primaryAction === 'pay' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark Paid</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Remind</span>
              </>
            )}
          </button>

          {/* Secondary actions overflow trigger (>=44px touch target on mobile) */}
          <button
            type="button"
            aria-label="More actions"
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(!showActionsMenu);
            }}
            className="w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </>
      ) : (
        /* Non-pending / paid member: single overflow trigger for secondary actions */
        <button
          type="button"
          aria-label="More actions"
          onClick={(e) => {
            e.stopPropagation();
            setShowActionsMenu(!showActionsMenu);
          }}
          className="w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}

      {/* Overflow Dropdown Menu */}
      {showActionsMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(false);
            }}
          />
          <div className="absolute right-0 top-10 w-48 bg-white border border-neutral-200 rounded-[var(--radius-xl)] shadow-lg z-50 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
            {/* If primary action is 'pay', secondary action is Remind */}
            {primaryAction === 'pay' && (
              <button
                type="button"
                className="flex items-center gap-2.5 px-3 min-h-[40px] text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-[var(--radius-lg)] text-left cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(false);
                  onRemind?.(member);
                }}
              >
                <MessageSquare className="w-4 h-4 text-neutral-400" />
                <span>Send Reminder</span>
              </button>
            )}

            {/* If primary action is 'remind', secondary action is Mark Paid */}
            {primaryAction === 'remind' && (
              <button
                type="button"
                className="flex items-center gap-2.5 px-3 min-h-[40px] text-xs font-bold text-[var(--color-success-700)] hover:bg-[var(--color-success-50)] rounded-[var(--radius-lg)] text-left cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(false);
                  setIsSuccessFlash(true);
                  setTimeout(() => onQuickPay?.(member), 800);
                }}
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success-600)]" />
                <span>Mark as Paid</span>
              </button>
            )}

            {/* View Member Profile */}
            <button
              type="button"
              className="flex items-center gap-2.5 px-3 min-h-[40px] text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-[var(--radius-lg)] text-left cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowActionsMenu(false);
                onSelect?.(member);
              }}
            >
              <User className="w-4 h-4 text-neutral-400" />
              <span>View Profile</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <ListRow
      onClick={() => onSelect?.(member)}
      className={cn(
        isSuccessFlash && 'pointer-events-none opacity-80 bg-[var(--color-success-50)]',
        className
      )}
      highlighted={highlighted || isSuccessFlash}
      isOverdue={isOverdue && !isSuccessFlash}
      leading={<Avatar name={displayName} />}
      title={displayName}
      subtitle={member.phone}
      status={metadataBadges}
      value={formatCurrency(displayFee, currencySymbol)}
      valueSubtitle={
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(member.nextPaymentDate, { format: 'short' })}
        </span>
      }
      actions={actionsNode}
    />
  );
};
