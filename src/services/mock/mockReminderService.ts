import { IReminderService, SendReminderDTO, SendReminderResult } from '../interfaces';
import { Reminder, Member, Gym, GymSettings, ReminderChannel, ReminderStatus } from '../../types';
import { storage } from '../storage';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import { generateUUID } from '../../utils/uuid';
import { MessagingProviderFactory } from '../messagingProviders';

export class MockReminderService implements IReminderService {
  async getReminders(gymId: string): Promise<Reminder[]> {
    await this.delay(60);
    const reminders = storage.getReminders();
    return reminders
      .filter((r) => !gymId || r.gymId === gymId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  async sendReminder(dto: SendReminderDTO): Promise<SendReminderResult> {
    await this.delay(180);
    const members = storage.getMembers();
    const target = members.find((m) => m.id === dto.memberId);
    const gym = storage.getGym();
    const settings = storage.getSettings();

    const channel: ReminderChannel = dto.channel || 'WHATSAPP';
    const provider = MessagingProviderFactory.getProvider(channel);

    const memberName = target?.name || 'Member';
    const memberPhone = target?.phone || '';
    const amount = dto.amount || target?.monthlyFee || 1500;
    const dueDate = dto.dueDate || target?.nextPaymentDate || new Date().toISOString().split('T')[0];
    const gymId = target?.gymId || gym.id;

    const message = dto.message && dto.message.trim() ? dto.message.trim() : (target ? provider.formatMessage(target, gym, settings) : '');

    const targetContact = channel === 'EMAIL' ? target?.email || '' : memberPhone;
    const dispatchResult = await provider.dispatch(targetContact, message);

    const newReminder: Reminder = {
      id: generateUUID(),
      gymId,
      memberId: dto.memberId,
      memberName,
      memberPhone,
      amount,
      dueDate,
      message,
      sentAt: new Date().toISOString(),
      channel,
      status: dispatchResult.status,
    };

    const reminders = storage.getReminders();
    reminders.unshift(newReminder);
    storage.setReminders(reminders);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return {
      reminder: newReminder,
      deepLink: dispatchResult.deepLink,
      providerRef: dispatchResult.providerRef,
    };
  }

  async logReminder(reminderData: Omit<Reminder, 'id'>): Promise<Reminder> {
    await this.delay(100);
    const newReminder: Reminder = {
      ...reminderData,
      id: generateUUID(),
    };
    const reminders = storage.getReminders();
    reminders.unshift(newReminder);
    storage.setReminders(reminders);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return newReminder;
  }

  generateReminderMessage(member: Member, gym?: Gym | null, settings?: GymSettings | null): string {
    const firstName = member.name.split(' ')[0] || member.name;
    const currentSettings = settings || storage.getSettings();
    const currency = currentSettings.currencySymbol || '₹';
    const formattedAmount = formatCurrency(member.monthlyFee, currency);
    const formattedDueDate = formatDate(member.nextPaymentDate, { format: 'medium' });
    const gymName = gym?.name || storage.getGym().name || 'the gym';

    const template = currentSettings.whatsappTemplate || currentSettings.reminderMessageTemplate;
    if (template) {
      return template
        .replace(/{name}/g, firstName)
        .replace(/{full_name}/g, member.name)
        .replace(/{gym_name}/g, gymName)
        .replace(/{amount}/g, formattedAmount)
        .replace(/{due_date}/g, formattedDueDate)
        .replace(/{upi_id}/g, gym?.upiId || '');
    }

    return `Hi ${firstName}, this is a friendly reminder that your gym membership payment of ${formattedAmount} is due on ${formattedDueDate}. Please make the payment at your convenience. Thank you! - ${gymName}`;
  }

  generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  generateSmsLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(message);
    return `sms:${cleanPhone}?body=${encodedText}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
