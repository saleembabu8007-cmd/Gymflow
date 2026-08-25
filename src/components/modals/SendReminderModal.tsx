import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { SegmentedControl } from '../ui/SegmentedControl';
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
  Edit2,
  Check,
  Send,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { parseAppError } from '../../utils/errorUtils';
import { cn } from '../../utils/classNames';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onReminderSent?: () => void;
}

const CHANNELS: { id: ReminderChannel; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
  { id: 'SMS', label: 'SMS', icon: Smartphone },
  { id: 'EMAIL', label: 'Email', icon: Mail },
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Generate standard suggested message
  const getDefaultMessage = (m: Member): string => {
    const firstName = m.name.split(' ')[0] || m.name;
    const formattedAmount = formatCurrency(m.monthlyFee, currencySymbol);
    return `Hi ${firstName}, this is a friendly reminder that your gym membership payment of ${formattedAmount} is due. Please make the payment at your convenience. Thank you.`;
  };

  useEffect(() => {
    if (member && isOpen) {
      setMessage(getDefaultMessage(member));
      setIsEditing(false);
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
        ? 'Member email address is missing. Please add an email address in member profile.'
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

      // If provider generated a client deepLink (WhatsApp, SMS, Email), launch it
      if (result.deepLink && typeof window !== 'undefined') {
        window.open(result.deepLink, '_blank');
      }

      // Display truth-confirmed status feedback
      const channelLabel = channel === 'WHATSAPP' ? 'WhatsApp' : channel === 'SMS' ? 'Messages' : 'Email';
      success(
        `${channelLabel} Opened`,
        `Opened ${channelLabel} draft for ${member.name}. Return to GymFlow once sent.`
      );

      if (onReminderSent) {
        onReminderSent();
      }

      onClose();
    } catch (err: any) {
      const msg = parseAppError(err, "Couldn't open reminder link. Please check recipient contact details.");
      setSendError(msg);
      showErrorToast("Couldn't open reminder link", msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetMessage = () => {
    setMessage(getDefaultMessage(member));
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Reminder"
      description={`Send a quick payment reminder to ${member.name}`}
      maxWidth="md"
    >
      <div className="flex flex-col h-full">
        <div className="space-y-6 flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Error notification banner with Retry */}
          {sendError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{sendError}</span>
              </div>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={handleSend}
                disabled={isSending}
                className="text-xs shrink-0 bg-white hover:bg-rose-100/50 text-rose-900 border-rose-200"
                leftIcon={<RotateCcw className="w-3 h-3" />}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Section 1: Member Context Summary Card */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] border border-slate-100">
            <div className="flex items-center justify-between text-xs">
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
                <span className="font-bold text-neutral-950 text-sm block">
                  {formatCurrency(member.monthlyFee, currencySymbol)}
                </span>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  {isOverdue ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded">
                      Overdue · {Math.abs(diffDays)}d
                    </span>
                  ) : isToday ? (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded">
                      Due today
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-600 bg-neutral-200/80 px-1.5 py-0.5 rounded">
                      Due {formatDate(member.nextPaymentDate, { format: 'medium' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Channel Selector */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] border border-slate-100 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              Delivery Channel
            </h4>
            
            <SegmentedControl
              options={[
                { value: 'WHATSAPP', label: 'WhatsApp' },
                { value: 'SMS', label: 'SMS' },
                { value: 'EMAIL', label: 'Email' }
              ]}
              value={channel}
              onChange={(val) => setChannel(val as ReminderChannel)}
            />
          </div>

          {/* Section 3: Message Content */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                Message Content
              </h4>
              {!isEditing ? (
                <button
                  type="button"
                  id="btn-toggle-edit-message"
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Message</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetMessage}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to default</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                id="reminder-message-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-white border border-neutral-300 p-3 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 leading-relaxed font-sans shadow-2xs"
                autoFocus
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                "{message}"
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-end gap-3 z-10 shrink-0">
          <Button
            type="button"
            variant="tertiary"
            size="md"
            onClick={onClose}
            disabled={isSending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            id="btn-submit-send-reminder"
            type="button"
            size="md"
            onClick={handleSend}
            isLoading={isSending}
            className="w-full sm:w-auto bg-neutral-900 text-white hover:bg-neutral-800 font-semibold px-5 shadow-2xs"
          >
            {isSending
              ? 'Opening...'
              : channel === 'WHATSAPP'
              ? 'Open WhatsApp'
              : channel === 'SMS'
              ? 'Open Messages'
              : 'Compose Email'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
