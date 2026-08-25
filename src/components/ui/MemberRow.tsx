import React, { useState } from 'react';
import { Member } from '../../types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../../utils/dateUtils';
import { Clock, CheckCircle2, MessageSquare, MoreHorizontal, Calendar } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { useMediaQuery } from '../../hooks/useMediaQuery';

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
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isSuccessFlash, setIsSuccessFlash] = useState(false);
  
  // Collapse threshold: 640px (sm breakpoint)
  const isDesktop = useMediaQuery('(min-width: 640px)');
  
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
        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
          Paid
        </Badge>
      );
    }
    
    if (isOverdue) {
      const days = Math.abs(diffDays);
      return (
        <Badge variant="danger" icon={<Clock className="w-3.5 h-3.5" />}>
          Overdue by {days} {days === 1 ? 'day' : 'days'}
        </Badge>
      );
    }
    if (isDueToday) {
      return (
        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5" />}>
          Due today
        </Badge>
      );
    }
    if (diffDays <= 3) {
      return (
        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5" />}>
          Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}
        </Badge>
      );
    }
    return (
      <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
        Paid up
      </Badge>
    );
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)] cursor-pointer overflow-hidden',
        isOverdue && !isSuccessFlash && 'border-l-4 border-l-rose-500 bg-rose-50/30 border-y-rose-200 border-r-rose-200',
        (highlighted || isSuccessFlash) && 'bg-emerald-50 border-emerald-200',
        isSuccessFlash && 'pointer-events-none shadow-none',
        className
      )}
      onClick={() => onSelect?.(member)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar name={displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-semibold text-[15px] sm:text-base text-slate-900 truncate">
              {displayName}
            </span>
            <div className="mt-1 sm:mt-0">
              {renderStatus()}
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-slate-600 font-mono tracking-tight">{member.phone}</span>
            <span className="text-[13px] text-slate-600">&middot;</span>
            <span className="text-[13px] text-slate-600">{displayPlan}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0 shrink-0">
        <div className="flex flex-col items-start sm:items-end mr-auto sm:mr-4">
          <span className="tabular-nums font-bold text-slate-900 tracking-tight text-[15px]">
            {formatCurrency(displayFee, currencySymbol)}
          </span>
          <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(member.nextPaymentDate, { format: 'short' })}
          </span>
        </div>

        {isPending && (
          <div className="relative flex items-center gap-2">
            {isDesktop ? (
              <>
                <Button
                  variant={primaryAction === 'remind' ? 'secondary' : 'tertiary'}
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemind?.(member);
                  }}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Remind
                </Button>
                <Button
                  variant={primaryAction === 'pay' ? 'secondary' : 'tertiary'}
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSuccessFlash(true);
                    setTimeout(() => {
                      onQuickPay?.(member);
                    }, 800);
                  }}
                >
                  Mark Paid
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (primaryAction === 'pay') {
                      setIsSuccessFlash(true);
                      setTimeout(() => onQuickPay?.(member), 800);
                    } else {
                      onRemind?.(member);
                    }
                  }}
                >
                  {primaryAction === 'pay' ? 'Mark Paid' : 'Remind'}
                </Button>
                <IconButton
                  icon={<MoreHorizontal className="w-5 h-5" />}
                  aria-label="Actions"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMobileActions(!showMobileActions);
                  }}
                />
                {showMobileActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMobileActions(false); }} />
                    <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col p-1">
                      {primaryAction === 'pay' ? (
                        <button
                          type="button"
                          className="flex items-center gap-3 px-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileActions(false);
                            onRemind?.(member);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Send Reminder
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center gap-3 px-3 min-h-[44px] text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileActions(false);
                            setIsSuccessFlash(true);
                            setTimeout(() => onQuickPay?.(member), 800);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
