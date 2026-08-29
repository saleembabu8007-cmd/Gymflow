import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/SearchInput';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { TwoTierNumber } from '../ui';
import { SearchResultSkeleton } from '../ui/Skeleton';
import { Member } from '../../types';
import { useMembers } from '../../hooks/useMembers';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';
import { formatCurrency } from '../../utils/currencyUtils';
import { motion, AnimatePresence } from 'motion/react';
import { useGymSettings } from '../../hooks/useGymSettings';
import { CreditCard, Bell, ChevronRight, User } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: Member) => void;
  onQuickPay: (member: Member) => void;
  onQuickRemind: (member: Member) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMember,
  onQuickPay,
  onQuickRemind,
}) => {
  const { members, loading } = useMembers();
  const showLoading = useDelayedLoading(loading, 400);
  const { currencySymbol } = useGymSettings();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredMembers = query.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
      )
    : members.slice(0, 5);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search Members"
      description="Quickly look up members, record payments or send reminders"
      maxWidth="lg"
    >
      <div className="space-y-4 p-4 sm:p-6">
        <SearchInput
          value={query}
          onSearchChange={setQuery}
          placeholder="Search by name, phone, or batch..."
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-neutral-100">
          <AnimatePresence mode="wait">
            {showLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-1.5"
              >
                {[1, 2, 3, 4].map((i) => (
                  <SearchResultSkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredMembers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="py-8 text-center text-xs text-neutral-500 space-y-2.5"
              >
                <p>No members found matching "{query}"</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-1.5 divide-y divide-neutral-100"
              >
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="pt-2 flex items-center justify-between p-2.5 rounded-[var(--radius-lg)] hover:bg-neutral-50 transition-colors group"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        onSelectMember(member);
                        onClose();
                      }}
                    >
                      <Avatar name={member.name} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[length:var(--text-body-size)] font-semibold text-neutral-900 truncate">
                            {member.name}
                          </span>
                          {member.calculatedStatus && (
                            <StatusBadge status={member.calculatedStatus} />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[length:var(--text-caption-size)] text-neutral-500 truncate">
                          <span>{member.phone}</span>
                          <span>&middot;</span>
                          <TwoTierNumber
                            value={formatCurrency(member.monthlyFee, currencySymbol)}
                            caption="/mo"
                            size="xs"
                            valueClassName="text-neutral-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickPay(member);
                          onClose();
                        }}
                        className="p-1.5 min-w-[44px] min-h-[44px] justify-center rounded-[var(--radius-sm)] text-[var(--color-success-700)] bg-[var(--color-success-50)] hover:bg-[var(--color-success-100)] text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Record Payment"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden sm:inline">Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickRemind(member);
                          onClose();
                        }}
                        className="p-1.5 min-w-[44px] min-h-[44px] justify-center rounded-[var(--radius-sm)] text-[var(--color-brand-700)] bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Send Reminder"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};
