import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Textarea } from '../ui/Textarea';
import { TwoTierNumber } from '../ui/TwoTierNumber';
import { Member, ReminderChannel } from '../../types';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useReminders } from '../../hooks/useReminders';
import { useToast } from '../ui/Toast';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, getDifferenceInDays } from '../../utils/dateUtils';
import {
  MessageSquare,
  Smartphone,
  Mail,
  Send,
  AlertCircle,
  Clock,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { parseAppError } from '../../utils/errorUtils';
import { cn } from '../../utils/classNames';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onReminderSent?: () => void;
}

const CHANNELS: { id: ReminderChannel; label: string; icon: React.ReactNode }[] = [
  { id: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'SMS', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'EMAIL', label: 'Email', icon: <Mail className="w-4 h-4" /> },
];

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  member,
  onReminderSent,
}) => {
  const { currencySymbol } = useGymSettings();
  const { sendReminder } = useReminders();
  const { success, error: showErrorToast } = useToast();

  const [channel, setChannel] = useState<ReminderChannel>('WHATSAPP');
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Generate friendly message copy
  const getDefaultMessage = (m: Member): string => {
    const firstName = m.name.split(' ')[0] || m.name;
    const formattedAmount = formatCurrency(Number(m.monthlyFee) || 0, currencySymbol);
    const diff = getDifferenceInDays(m.nextPaymentDate);
    
    if (diff < 0) {
      return `Hi ${firstName}, this is a gentle reminder that your gym membership fee of ${formattedAmount} was due on ${formatDate(m.nextPaymentDate, { format: 'medium' })}. Please clear your dues at your earliest convenience. Thank you!`;
    } else if (diff === 0) {
      return `Hi ${firstName}, your gym membership fee of ${formattedAmount} is due today. Please make the payment at your convenience. Thank you!`;
    } else {
      return `Hi ${firstName}, an early reminder that your gym membership renewal of ${formattedAmount} is due on ${formatDate(m.nextPaymentDate, { format: 'medium' })}. Thank you!`;
    }
  };

  useEffect(() => {
    if (member && isOpen) {
      setMessage(getDefaultMessage(member));
      setChannel('WHATSAPP');
      setIsSending(false);
      setSendError(null);
    }
  }, [member, isOpen, currencySymbol]);

  if (!member) return null;

  const diffDays = getDifferenceInDays(member.nextPaymentDate);
  const isOverdue = diffDays < 0;
  const isToday = diffDays === 0;

  const handleSend = async () => {
    const targetContact = channel === 'EMAIL' ? member.email : member.phone;
    const cleanContact = (targetContact || '').trim();

    if (!cleanContact) {
      const err = channel === 'EMAIL' 
        ? 'Member email address is missing. Please add an email in member profile.'
        : 'Member phone number is missing. Please add a phone number in member profile.';
      setSendError(err);
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      const result = await sendReminder({
        memberId: member.id,
        channel,
        message: message.trim(),
        amount: member.monthlyFee,
        dueDate: member.nextPaymentDate,
      });

      // Launch provider client deepLink if present (WhatsApp, SMS, Mailto)
      if (result.deepLink && typeof window !== 'undefined') {
        window.open(result.deepLink, '_blank');
      }

      const channelLabel = channel === 'WHATSAPP' ? 'WhatsApp' : channel === 'SMS' ? 'SMS' : 'Email';
      success(
        `${channelLabel} Opened`,
        `Drafted ${channelLabel} message for ${member.name}. Return to GymFlow once sent.`
      );

      if (onReminderSent) {
        onReminderSent();
      }

      onClose();
    } catch (err: any) {
      const msg = parseAppError(err, "Couldn't open reminder link. Please check recipient contact details.");
      setSendError(msg);
      showErrorToast("Couldn't dispatch reminder", msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetMessage = () => {
    setMessage(getDefaultMessage(member));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Payment Reminder"
      description={`Follow up with ${member.name} regarding membership fee.`}
      maxWidth="md"
      showCloseButton={!isSending}
    >
      <div className="p-5 sm:p-6 space-y-5 select-none font-sans">
        {/* Error notification banner */}
        {sendError && (
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-900)] flex items-center justify-between gap-3 text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--color-danger-600)] shrink-0" />
              <span>{sendError}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSend}
              disabled={isSending}
              leftIcon={<RotateCcw className="w-3 h-3" />}
            >
              Retry
            </Button>
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
                {member.phone}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <TwoTierNumber
              value={formatCurrency(Number(member.monthlyFee) || 0, currencySymbol)}
              caption={
                isOverdue
                  ? `Overdue (${Math.abs(diffDays)}d)`
                  : isToday
                  ? 'Due Today'
                  : `Due in ${diffDays}d`
              }
              size="xs"
              align="right"
              captionClassName={isOverdue ? 'text-[var(--color-danger-600)] font-bold' : undefined}
            />
          </div>
        </div>

        {/* Channel Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 block">
            Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 p-2.5 rounded-[var(--radius-md)] text-xs font-bold border transition-colors cursor-pointer',
                  channel === ch.id
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                )}
              >
                {ch.icon}
                <span>{ch.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview & Edit */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700">
              Message Preview
            </label>
            <button
              type="button"
              onClick={handleResetMessage}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Reset to default
            </button>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type reminder message..."
          />
          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
            <span>
              This will open {channel === 'WHATSAPP' ? 'WhatsApp' : channel === 'SMS' ? 'your messaging app' : 'your email client'} with your message pre-filled.
            </span>
          </p>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200/80">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSend}
            isLoading={isSending}
            disabled={isSending || !message.trim()}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Open {channel === 'WHATSAPP' ? 'WhatsApp' : channel === 'SMS' ? 'SMS' : 'Email'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
