import {
  User,
  Gym,
  Member,
  MembershipPlan,
  Membership,
  Payment,
  Reminder,
  GymSettings,
  PlatformGymTenant,
  PlatformStats,
  TenantSubscriptionStatus,
} from '../types';

export interface SignUpDTO {
  fullName: string;
  email: string;
  password?: string;
}

export interface CreateGymDTO {
  name: string;
  phone: string;
  currency?: string;
  timezone?: string;
  upiId?: string;
}

export interface RegisterGymOwnerDTO {
  ownerName: string;
  email: string;
  password?: string;
  phone: string;
  gymName: string;
  upiId?: string;
}

export interface AuditLogEntry {
  id: string;
  gymId?: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface SubscriptionDetails {
  gymId: string;
  gymName: string;
  planName: string;
  priceMonthlyINR: number;
  status: TenantSubscriptionStatus;
  renewalDate: string;
  features: string[];
}

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  login(email: string, password?: string): Promise<User>;
  signUp(dto: SignUpDTO): Promise<User>;
  registerOwner(dto: RegisterGymOwnerDTO): Promise<{ user: User; gym: Gym }>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string, token?: string): Promise<void>;
  updateProfile(updates: Partial<User>): Promise<User>;
}

export interface IGymService {
  getGym(gymId: string): Promise<Gym | null>;
  getGymByOwnerId(ownerId: string): Promise<Gym | null>;
  createGym(ownerId: string, dto: CreateGymDTO): Promise<Gym>;
  updateGym(gymId: string, updates: Partial<Gym>): Promise<Gym>;
  getPlans(gymId: string): Promise<MembershipPlan[]>;
  createPlan(gymId: string, plan: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>): Promise<MembershipPlan>;
  updatePlan(planId: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan>;
  deletePlan(planId: string): Promise<void>;
}

export interface IMemberFilterOptions {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'PENDING' | 'DUE_SOON' | 'EXPIRED';
  planId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'nextPaymentDate' | 'createdAt' | 'monthlyFee';
  sortOrder?: 'asc' | 'desc';
}

export interface IMemberService {
  getMembers(gymId: string, filter?: IMemberFilterOptions): Promise<Member[]>;
  getAttentionList(gymId: string, limit?: number): Promise<Member[]>;
  getMemberById(id: string): Promise<Member | null>;
  createMember(gymId: string, member: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>): Promise<Member>;
  updateMember(id: string, updates: Partial<Member>): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  markAsPaid(
    memberId: string,
    paymentDetails: {
      amount: number;
      method: unknown;
      paymentDate?: string;
      notes?: string;
      durationMonths?: number;
      recordedBy?: string;
    }
  ): Promise<{ member: Member; payment: Payment }>;
}

export interface IMembershipFilterOptions {
  memberId?: string;
  planId?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface IMembershipService {
  getPlans(gymId: string): Promise<MembershipPlan[]>;
  getPlanById(planId: string): Promise<MembershipPlan | null>;
  createPlan(gymId: string, plan: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>): Promise<MembershipPlan>;
  updatePlan(planId: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan>;
  deletePlan(planId: string): Promise<void>;
  getMemberships(gymId: string, filter?: IMembershipFilterOptions): Promise<Membership[]>;
  getMemberMemberships(memberId: string): Promise<Membership[]>;
  getActiveMembership(memberId: string): Promise<Membership | null>;
  createMembership(
    gymId: string,
    memberId: string,
    planId: string,
    details?: Partial<Membership>
  ): Promise<Membership>;
  renewMembership(membershipId: string, extensionMonths?: number): Promise<Membership>;
  cancelMembership(membershipId: string): Promise<Membership>;
}

export interface DashboardSummary {
  pendingCount: number;
  dueSoonCount: number;
  collectedThisMonth: number;
  activeMembersCount: number;
}

export interface IPaymentFilterOptions {
  search?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

export interface IPaymentService {
  getPayments(gymId: string, filter?: IPaymentFilterOptions): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | null>;
  recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>;
  deletePayment(id: string): Promise<void>;
  getMonthlySummary(gymId: string, year?: number, month?: number): Promise<{ totalCollected: number; transactionCount: number }>;
  getDashboardSummary(gymId: string): Promise<DashboardSummary>;
}

export interface SendReminderDTO {
  memberId: string;
  channel?: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'MANUAL';
  message?: string;
  amount?: number;
  dueDate?: string;
  status?: 'SENT' | 'FAILED' | 'PENDING';
}

export interface SendReminderResult {
  reminder: Reminder;
  deepLink?: string;
  providerRef?: string;
}

export interface IReminderService {
  getReminders(gymId: string): Promise<Reminder[]>;
  sendReminder(dto: SendReminderDTO): Promise<SendReminderResult>;
  logReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder>;
  generateReminderMessage(member: Member, gym?: Gym | null, settings?: GymSettings | null): string;
  generateWhatsAppLink(phone: string, message: string): string;
  generateSmsLink(phone: string, message: string): string;
}

export interface ISettingsService {
  getSettings(gymId: string): Promise<GymSettings>;
  updateSettings(gymId: string, updates: Partial<GymSettings>): Promise<GymSettings>;
  resetToDefaults(gymId: string): Promise<GymSettings>;
}

export interface SubscriptionPlanConfig {
  id?: string;
  code: string;
  name: string;
  amount: number;
  currency: string;
  features: string[];
  active: boolean;
}

export interface ISubscriptionService {
  getCurrentSubscription(gymId: string): Promise<SubscriptionDetails>;
  getSubscriptionStatus(gymId: string): Promise<TenantSubscriptionStatus>;
  canAccessApp(gymId: string): Promise<boolean>;
  getCurrentPlan(): Promise<SubscriptionPlanConfig>;
  getSubscriptionDetails(gymId: string): Promise<SubscriptionDetails>;
  createCheckoutSession(gymId: string): Promise<{ success: boolean; orderId: string; checkoutUrl: string }>;
  triggerPaymentVerification(gymId: string, simulateSuccess?: boolean): Promise<{ success: boolean; status: TenantSubscriptionStatus; message: string }>;
}

export interface IAdminService {
  getStats(): Promise<PlatformStats>;
  getGymTenants(): Promise<PlatformGymTenant[]>;
  updateGymStatus(gymId: string, status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'): Promise<PlatformGymTenant>;
}

export interface IAuditService {
  getLogs(gymId?: string): Promise<AuditLogEntry[]>;
  logAction(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry>;
}

export interface IServiceContainer {
  auth: IAuthService;
  gym: IGymService;
  members: IMemberService;
  memberships: IMembershipService;
  payments: IPaymentService;
  reminders: IReminderService;
  settings: ISettingsService;
  subscription: ISubscriptionService;
  admin: IAdminService;
  audit: IAuditService;
}
