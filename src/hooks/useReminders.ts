import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { Reminder, Member, Gym, GymSettings, ReminderChannel } from '../types';
import { SendReminderDTO, SendReminderResult } from '../services/interfaces';
import { formatCurrency } from '../utils/currencyUtils';
import { DEFAULT_GYM_ID } from '../data/mockData';

export function useReminders(gymId: string = DEFAULT_GYM_ID) {
  const { reminders: reminderService } = useServices();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders(gymId);
      setReminders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, [reminderService, gymId]);

  useEffect(() => {
    fetchReminders();

    const handleStorageUpdate = () => {
      fetchReminders();
    };

    window.addEventListener('gymflow_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('gymflow_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [fetchReminders]);

  const sendReminder = useCallback(
    async (dto: SendReminderDTO): Promise<SendReminderResult> => {
      const result = await reminderService.sendReminder(dto);
      setReminders((prev) => [result.reminder, ...prev.filter((r) => r.id !== result.reminder.id)]);
      return result;
    },
    [reminderService]
  );

  const logReminder = useCallback(
    async (reminderData: Omit<Reminder, 'id'>) => {
      const created = await reminderService.logReminder(reminderData);
      setReminders((prev) => [created, ...prev]);
      return created;
    },
    [reminderService]
  );

  const generateMessage = useCallback(
    (member: Member, gym?: Gym | null, settings?: GymSettings | null) => {
      return reminderService.generateReminderMessage(member, gym, settings);
    },
    [reminderService]
  );

  const getWhatsAppLink = useCallback(
    (phone: string, message: string) => {
      return reminderService.generateWhatsAppLink(phone, message);
    },
    [reminderService]
  );

  const getSmsLink = useCallback(
    (phone: string, message: string) => {
      return reminderService.generateSmsLink(phone, message);
    },
    [reminderService]
  );

  return {
    reminders,
    loading,
    error,
    sendReminder,
    logReminder,
    generateMessage,
    getWhatsAppLink,
    getSmsLink,
    refresh: fetchReminders,
  };
}
