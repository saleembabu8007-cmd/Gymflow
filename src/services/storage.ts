import { Gym, User, Member, MembershipPlan, Membership, Payment, ReminderLog, GymSettings } from '../types';
import {
  INITIAL_GYM,
  INITIAL_USER,
  INITIAL_SETTINGS,
  INITIAL_PLANS,
  INITIAL_MEMBERS,
  INITIAL_MEMBERSHIPS,
  INITIAL_PAYMENTS,
  INITIAL_REMINDERS,
} from './mockData';

const STORAGE_KEYS = {
  GYM: 'gymflow_gym_data',
  USER: 'gymflow_auth_user',
  SETTINGS: 'gymflow_settings_data',
  PLANS: 'gymflow_plans_data',
  MEMBERSHIPS: 'gymflow_memberships_data',
  MEMBERS: 'gymflow_members_data',
  PAYMENTS: 'gymflow_payments_data',
  REMINDERS: 'gymflow_reminders_data',
  AUTH_SESSION: 'gymflow_auth_session',
  ONBOARDED: 'gymflow_onboarded',
};

class LocalStorageProvider {
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof localStorage === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        this.setItem(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  }

  getGym(): Gym {
    return this.getItem<Gym>(STORAGE_KEYS.GYM, INITIAL_GYM);
  }

  setGym(gym: Gym): void {
    this.setItem(STORAGE_KEYS.GYM, gym);
  }

  getUser(): User {
    return this.getItem<User>(STORAGE_KEYS.USER, INITIAL_USER);
  }

  setUser(user: User): void {
    this.setItem(STORAGE_KEYS.USER, user);
  }

  getSettings(): GymSettings {
    return this.getItem<GymSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  setSettings(settings: GymSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  getPlans(): MembershipPlan[] {
    return this.getItem<MembershipPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  }

  setPlans(plans: MembershipPlan[]): void {
    this.setItem(STORAGE_KEYS.PLANS, plans);
  }

  getMemberships(): Membership[] {
    return this.getItem<Membership[]>(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
  }

  setMemberships(memberships: Membership[]): void {
    this.setItem(STORAGE_KEYS.MEMBERSHIPS, memberships);
  }

  getMembers(): Member[] {
    return this.getItem<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  }

  setMembers(members: Member[]): void {
    this.setItem(STORAGE_KEYS.MEMBERS, members);
  }

  getPayments(): Payment[] {
    return this.getItem<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }

  setPayments(payments: Payment[]): void {
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
  }

  getReminders(): ReminderLog[] {
    return this.getItem<ReminderLog[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
  }

  setReminders(reminders: ReminderLog[]): void {
    this.setItem(STORAGE_KEYS.REMINDERS, reminders);
  }

  getAuthSession(): { isAuthenticated: boolean; user: User | null } {
    return this.getItem(STORAGE_KEYS.AUTH_SESSION, {
      isAuthenticated: false,
      user: null,
    });
  }

  setAuthSession(session: { isAuthenticated: boolean; user: User | null }): void {
    this.setItem(STORAGE_KEYS.AUTH_SESSION, session);
  }

  isOnboarded(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.ONBOARDED, false);
  }

  setOnboarded(value: boolean): void {
    this.setItem(STORAGE_KEYS.ONBOARDED, value);
  }

  resetToDefaultData(): void {
    this.setGym(INITIAL_GYM);
    this.setUser(INITIAL_USER);
    this.setSettings(INITIAL_SETTINGS);
    this.setPlans(INITIAL_PLANS);
    this.setMemberships(INITIAL_MEMBERSHIPS);
    this.setMembers(INITIAL_MEMBERS);
    this.setPayments(INITIAL_PAYMENTS);
    this.setReminders(INITIAL_REMINDERS);
    this.setAuthSession({ isAuthenticated: false, user: null });
    this.setOnboarded(false);
  }
}

export const storage = new LocalStorageProvider();
