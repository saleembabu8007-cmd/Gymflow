import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/SearchInput';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { Member } from '../../types';
import { useMembers } from '../../hooks/useMembers';
import { formatCurrency } from '../../utils/currencyUtils';
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
  const { members } = useMembers();
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
      <div className="space-y-4">
        <SearchInput
          value={query}
          onSearchChange={setQuery}
          placeholder="Search by name, phone, or batch..."
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-neutral-100">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 space-y-2.5">
              <p>No members found matching "{query}"</p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="pt-2 first:pt-0 flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => {
                    onSelectMember(member);
                    onClose();
                  }}
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 truncate">
                        {member.name}
                      </span>
                      {member.calculatedStatus && (
                        <StatusBadge status={member.calculatedStatus} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{member.phone} • {formatCurrency(member.monthlyFee, currencySymbol)}/mo</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-90 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      onQuickPay(member);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Record Payment"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickRemind(member);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-neutral-700 bg-neutral-100 hover:bg-neutral-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Send Reminder"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
