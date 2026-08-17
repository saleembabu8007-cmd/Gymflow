import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Gym, User, Member, Payment, Reminder, GymSettings } from '../types';
import { gymService } from '../services/gymService';
import { authService } from '../services/authService';
import { memberService } from '../services/memberService';
import { paymentService } from '../services/paymentService';
import { reminderService } from '../services/reminderService';
import { settingsService } from '../services/settingsService';
import { storage } from '../services/storage';
import { getTodayString } from '../utils/dateUtils';
import { DEFAULT_GYM_ID } from '../data/mockData';
import { SendReminderDTO } from '../services/interfaces';

export interface CreateMemberDTO {
  name: string;
  phone: string;
  email?: string;
  planName: string;
  durationMonths: number;
  monthlyFee: number;
  startDate: string;
  nextPaymentDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

export interface RecordPaymentDTO {
  gymId?: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  paymentDate: string;
  paymentMethod: any;
  periodCovered?: string;
  notes?: string;
  recordedBy?: string;
}

interface GymContextType {
  gym: Gym | null;
  user: User | null;
  settings: GymSettings;
  members: Member[];
  payments: Payment[];
  reminders: Reminder[];
  loading: boolean;
  isOnboarded: boolean;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;

  // Actions
  refreshData: () => Promise<void>;
  addMember: (data: CreateMemberDTO) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
  recordPayment: (data: RecordPaymentDTO) => Promise<Payment>;
  sendReminder: (data: SendReminderDTO) => Promise<Reminder>;
  updateGym: (updates: Partial<Gym>) => Promise<void>;
  updateSettings: (updates: Partial<GymSettings>) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetDemoData: () => Promise<void>;
  completeOnboarding: (gymName: string) => Promise<void>;

  // Computed metrics
  pendingMembers: Member[];
  dueTodayMembers: Member[];
  dueSoonMembers: Member[];
  paidMembers: Member[];
  expiredMembers: Member[];
  needsAttentionList: Member[];
  collectedThisMonth: number;
  activeMembersCount: number;
  totalMembersCount: number;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<GymSettings>(storage.getSettings());
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const activeGymId = gym?.id || DEFAULT_GYM_ID;

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const currUser = await authService.getCurrentUser();
      const currentGymId = currUser?.gymId || DEFAULT_GYM_ID;

      const [currGym, currSettings, currMembers, currPayments, currReminders] = await Promise.all([
        gymService.getGym(currentGymId),
        settingsService.getSettings(currentGymId),
        memberService.getMembers(currentGymId),
        paymentService.getPayments(currentGymId),
        reminderService.getReminders(currentGymId),
      ]);

      setUser(currUser);
      setGym(currGym);
      setSettings(currSettings);
      setMembers(currMembers);
      setPayments(currPayments);
      setReminders(currReminders);
      setIsOnboarded(storage.isOnboarded());
    } catch (err) {
      console.error('Error loading GymFlow data:', err);
      showToast('Could not load data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions
  const handleAddMember = async (data: CreateMemberDTO): Promise<Member> => {
    const newMember = await memberService.createMember(activeGymId, data);
    await refreshData();
    showToast('Member added successfully.');
    return newMember;
  };

  const handleUpdateMember = async (id: string, updates: Partial<Member>): Promise<Member> => {
    const updated = await memberService.updateMember(id, updates);
    await refreshData();
    showToast('Member details updated.');
    return updated;
  };

  const handleDeleteMember = async (id: string): Promise<void> => {
    await memberService.deleteMember(id);
    await refreshData();
    showToast('Member deleted.');
  };

  const handleRecordPayment = async (data: RecordPaymentDTO): Promise<Payment> => {
    const payment = await paymentService.recordPayment({
      gymId: data.gymId || activeGymId,
      memberId: data.memberId,
      memberName: data.memberName,
      memberPhone: data.memberPhone,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      periodCovered: data.periodCovered,
      notes: data.notes,
      recordedBy: data.recordedBy,
    });
    await refreshData();
    showToast('Payment recorded.');
    return payment;
  };

  const handleSendReminder = async (data: SendReminderDTO): Promise<Reminder> => {
    const result = await reminderService.sendReminder(data);
    await refreshData();
    showToast('Reminder recorded.');
    return result.reminder;
  };

  const handleUpdateGym = async (updates: Partial<Gym>): Promise<void> => {
    if (!gym) return;
    const updated = await gymService.updateGym(gym.id, updates);
    setGym(updated);
    showToast('Gym details saved.');
  };

  const handleUpdateSettings = async (updates: Partial<GymSettings>): Promise<void> => {
    if (!gym) return;
    const updated = await settingsService.updateSettings(gym.id, updates);
    setSettings(updated);
    await refreshData();
    showToast('Settings saved.');
  };

  const handleUpdateUser = async (updates: Partial<User>): Promise<void> => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    showToast('Profile updated.');
  };

  const handleResetDemoData = async (): Promise<void> => {
    storage.resetToDefaultData();
    await refreshData();
    showToast('Demo data reset to fresh defaults.');
  };

  const handleCompleteOnboarding = async (gymName: string): Promise<void> => {
    if (gym) {
      await gymService.updateGym(gym.id, { name: gymName });
    }
    storage.setOnboarded(true);
    setIsOnboarded(true);
    await refreshData();
    showToast("You're ready! Welcome to GymFlow.");
  };

  // Grouped members by status
  const pendingMembers = useMemo(() => members.filter((m) => m.calculatedStatus === 'OVERDUE'), [members]);
  const dueTodayMembers = useMemo(() => members.filter((m) => m.calculatedStatus === 'DUE_TODAY'), [members]);
  const dueSoonMembers = useMemo(() => members.filter((m) => m.calculatedStatus === 'DUE_SOON'), [members]);
  const paidMembers = useMemo(() => members.filter((m) => m.calculatedStatus === 'PAID'), [members]);
  const expiredMembers = useMemo(() => members.filter((m) => m.calculatedStatus === 'EXPIRED'), [members]);

  // Urgent list for Today screen (Overdue first, then Due Today, then Due Soon)
  const needsAttentionList = useMemo(() => {
    const sortedOverdue = [...pendingMembers].sort((a, b) => (a.daysDifference ?? 0) - (b.daysDifference ?? 0));
    return [...sortedOverdue, ...dueTodayMembers, ...dueSoonMembers];
  }, [pendingMembers, dueTodayMembers, dueSoonMembers]);

  // Collected this month
  const collectedThisMonth = useMemo(() => {
    const today = getTodayString();
    const currentYearMonth = today.substring(0, 7); // e.g. "2026-08"
    return payments
      .filter((p) => p.paymentDate.startsWith(currentYearMonth))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const activeMembersCount = useMemo(() => members.filter((m) => m.status === 'ACTIVE').length, [members]);
  const totalMembersCount = members.length;

  return (
    <GymContext.Provider
      value={{
        gym,
        user,
        settings,
        members,
        payments,
        reminders,
        loading,
        isOnboarded,
        toast,
        showToast,
        hideToast,
        refreshData,
        addMember: handleAddMember,
        updateMember: handleUpdateMember,
        deleteMember: handleDeleteMember,
        recordPayment: handleRecordPayment,
        sendReminder: handleSendReminder,
        updateGym: handleUpdateGym,
        updateSettings: handleUpdateSettings,
        updateUser: handleUpdateUser,
        resetDemoData: handleResetDemoData,
        completeOnboarding: handleCompleteOnboarding,
        pendingMembers,
        dueTodayMembers,
        dueSoonMembers,
        paidMembers,
        expiredMembers,
        needsAttentionList,
        collectedThisMonth,
        activeMembersCount,
        totalMembersCount,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGymContext = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGymContext must be used within a GymProvider');
  }
  return context;
};

export const useGym = useGymContext;
