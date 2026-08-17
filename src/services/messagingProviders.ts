import { Member, ReminderChannel, GymSettings, Gym } from '../types';

export interface ProviderDispatchResult {
  success: boolean;
  status: 'SENT' | 'FAILED' | 'PENDING';
  deepLink?: string;
  error?: string;
  providerRef?: string;
}

export interface IMessagingProvider {
  channel: ReminderChannel;
  formatMessage(member: Member, gym?: Gym | null, settings?: GymSettings | null): string;
  dispatch(phoneOrEmail: string, message: string): Promise<ProviderDispatchResult>;
}

export class WhatsAppProvider implements IMessagingProvider {
  channel: ReminderChannel = 'WHATSAPP';

  formatMessage(member: Member, gym?: Gym | null, settings?: GymSettings | null): string {
    const template =
      settings?.whatsappTemplate ||
      'Hi {member_name}, your gym membership fee of ₹{amount} is due on {due_date}. Please pay via UPI ({upi_id}) to keep your access active. Thank you! - {gym_name}';

    return template
      .replace('{member_name}', member.name)
      .replace('{amount}', member.monthlyFee.toLocaleString('en-IN'))
      .replace('{due_date}', member.nextPaymentDate)
      .replace('{gym_name}', gym?.name || 'Iron Fitness')
      .replace('{upi_id}', gym?.upiId || 'gym@upi');
  }

  async dispatch(phone: string, message: string): Promise<ProviderDispatchResult> {
    const cleanPhone = (phone || '').replace(/[^\d]/g, '');
    if (!cleanPhone) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Recipient phone number missing or invalid',
      };
    }
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const deepLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    return {
      success: true,
      status: 'SENT',
      deepLink,
      providerRef: `wa_${Date.now()}`,
    };
  }
}

export class SMSProvider implements IMessagingProvider {
  channel: ReminderChannel = 'SMS';

  formatMessage(member: Member, _gym?: Gym | null, _settings?: GymSettings | null): string {
    return `Hi ${member.name}, your gym fee of ₹${member.monthlyFee} is due on ${member.nextPaymentDate}. Please pay at your earliest. Thank you!`;
  }

  async dispatch(phone: string, message: string): Promise<ProviderDispatchResult> {
    const cleanPhone = (phone || '').replace(/[^\d]/g, '');
    if (!cleanPhone) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Recipient phone number missing or invalid',
      };
    }
    const deepLink = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;

    return {
      success: true,
      status: 'SENT',
      deepLink,
      providerRef: `sms_${Date.now()}`,
    };
  }
}

export class EmailProvider implements IMessagingProvider {
  channel: ReminderChannel = 'EMAIL';

  formatMessage(member: Member, gym?: Gym | null, _settings?: GymSettings | null): string {
    return `Dear ${member.name},\n\nThis is a friendly reminder that your membership fee of ₹${member.monthlyFee} at ${gym?.name || 'the gym'} is due on ${member.nextPaymentDate}.\n\nThank you for choosing us!`;
  }

  async dispatch(email: string, message: string): Promise<ProviderDispatchResult> {
    if (!email || !email.trim()) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Recipient email address missing',
      };
    }
    const deepLink = `mailto:${email.trim()}?subject=${encodeURIComponent('Gym Membership Fee Reminder')}&body=${encodeURIComponent(message)}`;

    return {
      success: true,
      status: 'SENT',
      deepLink,
      providerRef: `email_${Date.now()}`,
    };
  }
}

export class MessagingProviderFactory {
  private static providers: Map<ReminderChannel, IMessagingProvider> = new Map([
    ['WHATSAPP', new WhatsAppProvider()],
    ['SMS', new SMSProvider()],
    ['EMAIL', new EmailProvider()],
  ]);

  static getProvider(channel: ReminderChannel): IMessagingProvider {
    const provider = this.providers.get(channel);
    if (!provider) {
      return this.providers.get('WHATSAPP')!;
    }
    return provider;
  }
}
