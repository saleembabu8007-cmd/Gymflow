import { IReminderService } from './interfaces';
import { defaultServices } from './index';

export const reminderService: IReminderService = {
  getReminders: (gymId) => defaultServices.reminders.getReminders(gymId),
  sendReminder: (dto) => defaultServices.reminders.sendReminder(dto),
  logReminder: (reminder) => defaultServices.reminders.logReminder(reminder),
  generateReminderMessage: (member, gym, settings) =>
    defaultServices.reminders.generateReminderMessage(member, gym, settings),
  generateWhatsAppLink: (phone, message) =>
    defaultServices.reminders.generateWhatsAppLink(phone, message),
  generateSmsLink: (phone, message) => defaultServices.reminders.generateSmsLink(phone, message),
};

export default reminderService;
