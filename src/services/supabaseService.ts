import { supabase } from './supabaseClient';
import {
  IServiceContainer,
  IAuthService,
  IGymService,
  IMemberService,
  IMembershipService,
  IPaymentService,
  IReminderService,
  ISettingsService,
  IAdminService,
  RegisterGymOwnerDTO,
  IMemberFilterOptions,
  IPaymentFilterOptions,
  IMembershipFilterOptions,
  SendReminderDTO,
  SendReminderResult,
  DashboardSummary,
} from './interfaces';
import { MessagingProviderFactory } from './messagingProviders';
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
} from '../types';

import { parseAuthError } from '../utils/errorUtils';
import { parseLocalDate } from '../utils/dateUtils';
import { env } from '../config/env';

class SupabaseAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile) {
      return {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        gymId: session.user.user_metadata?.gym_id || '',
        role: (session.user.user_metadata?.role as any) || 'GYM_OWNER',
      };
    }

    let gymId = profile.gym_id || '';
    if (!gymId && profile.role !== 'PLATFORM_ADMIN' && profile.role !== 'platform_admin') {
      try {
        const { data: gymData } = await (supabase as any)
          .from('gyms')
          .select('id')
          .or(`owner_user_id.eq.${profile.id},owner_id.eq.${profile.id}`)
          .maybeSingle();
        if (gymData?.id) {
          gymId = gymData.id;
          await (supabase as any).from('profiles').update({ gym_id: gymId }).eq('id', profile.id);
        }
      } catch (e) {
        console.warn('Gym resolution fallback notice:', e);
      }
    }

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone || undefined,
      gymId,
      role: profile.role as any,
      avatarUrl: profile.avatar_url || undefined,
    };
  }

  async login(email: string, password?: string): Promise<User> {
    if (!supabase) throw new Error('Supabase client not configured');
    if ((import.meta as any).env?.DEV) {
      console.log('[SUPABASE] URL:', env.SUPABASE_URL);
      console.log('[AUTH] supabase.auth.signInWithPassword starting for:', email);
    }
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'password123',
    });

    if ((import.meta as any).env?.DEV) {
      console.log('[AUTH] signInWithPassword response:', {
        userId: authData?.user?.id,
        email: authData?.user?.email,
        hasSession: !!authData?.session,
        error,
      });
    }

    if (error) throw new Error(parseAuthError(error));
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User profile not found after login');
    return user;
  }

  async signUp(dto: { fullName: string; email: string; password?: string }): Promise<User> {
    if (!supabase) throw new Error('Supabase client not configured');

    if ((import.meta as any).env?.DEV) {
      console.log('[SUPABASE] URL:', env.SUPABASE_URL);
      console.log('[AUTH] supabase.auth.signUp starting for:', dto.email);
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password || 'GymFlow@2026',
      options: {
        data: {
          full_name: dto.fullName,
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/app/today` : undefined,
      },
    });

    if ((import.meta as any).env?.DEV) {
      console.log('[AUTH] supabase.auth.signUp response:', {
        userId: authData?.user?.id,
        email: authData?.user?.email,
        hasSession: !!authData?.session,
        identities: authData?.user?.identities,
        authError,
      });
    }

    if (authError) {
      throw new Error(parseAuthError(authError));
    }

    if (!authData.user) throw new Error('Failed to create account.');

    if (authData.user.identities && authData.user.identities.length === 0) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    if (!authData.session) {
      throw new Error('SUCCESS_EMAIL_CONFIRMATION_REQUIRED');
    }

    const user = await this.getCurrentUser();
    if (user) return user;

    return {
      id: authData.user.id,
      name: dto.fullName,
      email: dto.email,
      gymId: '',
      role: 'GYM_OWNER',
    };
  }

  async registerOwner(dto: RegisterGymOwnerDTO): Promise<{ user: User; gym: Gym }> {
    if (!supabase) throw new Error('Supabase client not configured');

    if ((import.meta as any).env?.DEV) {
      console.log('[SUPABASE] URL:', env.SUPABASE_URL);
      console.log('[AUTH] registerOwner starting for:', dto.email);
    }

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password || 'GymFlow@2026',
      options: {
        data: {
          full_name: dto.ownerName,
          phone: dto.phone,
          gym_name: dto.gymName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user account');

    // 2. Call RPC to register gym owner, profile, subscription, and gym settings
    const { data: rpcRes, error: rpcError } = await (supabase as any).rpc('register_gym_owner', {
      p_owner_name: dto.ownerName,
      p_phone: dto.phone,
      p_gym_name: dto.gymName,
      p_upi_id: dto.upiId || null,
    });

    if (rpcError) {
      throw new Error(parseAuthError(rpcError));
    }

    const gymId = rpcRes.gym_id;
    const user: User = {
      id: authData.user.id,
      name: dto.ownerName,
      email: dto.email,
      phone: dto.phone,
      gymId,
      role: 'GYM_OWNER',
    };

    const gym: Gym = {
      id: gymId,
      name: dto.gymName,
      phone: dto.phone,
      upiId: dto.upiId || undefined,
      ownerId: authData.user.id,
      createdAt: new Date().toISOString(),
    };

    return { user, gym };
  }

  async logout(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    if (!supabase) return;
    await supabase.auth.resetPasswordForEmail(email);
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (!supabase) return;
    await supabase.auth.updateUser({ password: newPassword });
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('Supabase client not configured');
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('No authenticated user');

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        full_name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id);

    if (error) throw error;
    return { ...currentUser, ...updates };
  }
}

class SupabaseGymService implements IGymService {
  async getGym(gymId: string): Promise<Gym | null> {
    if (!supabase) return null;
    const { data } = await (supabase as any).from('gyms').select('*').eq('id', gymId).maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      upiId: data.upi_id || undefined,
      logoUrl: data.logo_url || undefined,
      ownerId: data.owner_user_id || data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getGymByOwnerId(ownerId: string): Promise<Gym | null> {
    if (!supabase) return null;
    const { data } = await (supabase as any)
      .from('gyms')
      .select('*')
      .or(`owner_user_id.eq.${ownerId},owner_id.eq.${ownerId}`)
      .maybeSingle();

    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      upiId: data.upi_id || undefined,
      logoUrl: data.logo_url || undefined,
      ownerId: data.owner_user_id || data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async createGym(ownerId: string, dto: { name: string; phone: string; currency?: string; timezone?: string; upiId?: string }): Promise<Gym> {
    if (!supabase) throw new Error('Supabase client not configured');

    // Fetch live authenticated user ID to guarantee matching auth.uid() in Supabase RLS
    const { data: authUserData } = await supabase.auth.getUser();
    const currentAuthId = authUserData?.user?.id || ownerId;

    // 1. Enforce 1-Gym Per Owner Rule
    const existing = await this.getGymByOwnerId(currentAuthId);
    if (existing) {
      return existing;
    }

    const authUser = authUserData?.user;
    const email = authUser?.email || `${currentAuthId}@gymflow.app`;
    const fullName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Gym Owner';

    // 2. Call SECURITY DEFINER register_gym_owner RPC (Bypasses RLS and atomically creates Profile + Gym)
    const { data: rpcRes, error: rpcError } = await (supabase as any).rpc('register_gym_owner', {
      p_owner_name: fullName,
      p_phone: dto.phone,
      p_gym_name: dto.name,
      p_upi_id: dto.upiId || null,
    });

    if (!rpcError && rpcRes && rpcRes.gym_id) {
      const created = await this.getGym(rpcRes.gym_id);
      if (created) return created;
    }

    // 3. Ensure Profile exists in public.profiles (satisfies foreign key fk_gyms_owner)
    try {
      await (supabase as any).from('profiles').upsert(
        {
          id: currentAuthId,
          role: 'GYM_OWNER',
          full_name: fullName,
          email: email,
          phone: dto.phone,
        },
        { onConflict: 'id' }
      );
    } catch (profileErr) {
      console.warn('[SUPABASE] Profile pre-upsert warning:', profileErr);
    }

    // 4. Resilient Direct Table Insertion Strategy matching currentAuthId
    let gymData: any = null;
    let insertError: any = null;

    // Attempt A: Standard insert with explicit owner_id and owner_user_id
    const resA = await (supabase as any)
      .from('gyms')
      .insert({
        owner_id: currentAuthId,
        owner_user_id: currentAuthId,
        name: dto.name,
        phone: dto.phone,
        upi_id: dto.upiId || null,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (!resA.error && resA.data) {
      gymData = resA.data;
    } else {
      insertError = resA.error;
      // Attempt B: Fallback insert with minimal fields
      const resB = await (supabase as any)
        .from('gyms')
        .insert({
          owner_id: currentAuthId,
          name: dto.name,
          phone: dto.phone,
        })
        .select()
        .single();

      if (!resB.error && resB.data) {
        gymData = resB.data;
        insertError = null;
      }
    }

    if (insertError && !gymData) {
      console.error('[SUPABASE] createGym error details:', insertError);
      const rawMsg = insertError?.message || insertError?.details || parseAuthError(insertError);
      throw new Error(rawMsg);
    }

    // 4. Update profile gym_id link
    try {
      await (supabase as any).from('profiles').update({ gym_id: gymData.id }).eq('id', ownerId);
    } catch (e) {
      console.warn('[SUPABASE] Profile gym_id link warning:', e);
    }

    // 5. Upsert default gym settings
    try {
      await (supabase as any).from('gym_settings').upsert({ gym_id: gymData.id });
    } catch (e) {
      console.warn('[SUPABASE] Gym settings upsert warning:', e);
    }

    return {
      id: gymData.id,
      name: gymData.name,
      phone: gymData.phone,
      address: gymData.address || undefined,
      city: gymData.city || undefined,
      state: gymData.state || undefined,
      country: gymData.country || undefined,
      upiId: gymData.upi_id || undefined,
      logoUrl: gymData.logo_url || undefined,
      ownerId: ownerId,
      createdAt: gymData.created_at,
      updatedAt: gymData.updated_at,
    };
  }

  async updateGym(gymId: string, updates: Partial<Gym>): Promise<Gym> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await (supabase as any)
      .from('gyms')
      .update({
        name: updates.name,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        state: updates.state,
        country: updates.country,
        upi_id: updates.upiId,
        logo_url: updates.logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gymId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      upiId: data.upi_id || undefined,
      logoUrl: data.logo_url || undefined,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getPlans(gymId: string): Promise<MembershipPlan[]> {
    if (!supabase) return [];
    const { data } = await (supabase as any)
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_active', true);

    return (data || []).map((p: any) => ({
      id: p.id,
      gymId: p.gym_id,
      name: p.name,
      durationMonths: p.duration_months,
      defaultFee: Number(p.default_fee),
      description: p.description || undefined,
      isActive: p.is_active,
      createdAt: p.created_at,
    }));
  }

  async createPlan(gymId: string, plan: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>): Promise<MembershipPlan> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await (supabase as any)
      .from('membership_plans')
      .insert({
        gym_id: gymId,
        name: plan.name,
        duration_months: plan.durationMonths,
        default_fee: plan.defaultFee,
        description: plan.description || null,
        is_active: plan.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      name: data.name,
      durationMonths: data.duration_months,
      defaultFee: Number(data.default_fee),
      description: data.description || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  async updatePlan(planId: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await (supabase as any)
      .from('membership_plans')
      .update({
        name: updates.name,
        duration_months: updates.durationMonths,
        default_fee: updates.defaultFee,
        description: updates.description,
        is_active: updates.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      name: data.name,
      durationMonths: data.duration_months,
      defaultFee: Number(data.default_fee),
      description: data.description || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  async deletePlan(planId: string): Promise<void> {
    if (!supabase) return;
    await (supabase as any).from('membership_plans').update({ is_active: false }).eq('id', planId);
  }
}

class SupabaseMemberService implements IMemberService {
  async getMembers(gymId: string, filter?: IMemberFilterOptions): Promise<Member[]> {
    if (!supabase) return [];
    let query = (supabase as any).from('gym_members').select('*').eq('gym_id', gymId);

    if (filter?.search) {
      query = query.or(`name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%`);
    }

    if (filter?.status && filter.status !== 'ALL') {
      const todayStr = new Date().toISOString().split('T')[0];
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

      if (filter.status === 'ACTIVE') {
        query = query.or('status.eq.ACTIVE,status.eq.active');
      } else if (filter.status === 'PENDING') {
        query = query.or('status.eq.ACTIVE,status.eq.active').lte('next_payment_date', todayStr);
      } else if (filter.status === 'DUE_SOON') {
        query = query.or('status.eq.ACTIVE,status.eq.active').gt('next_payment_date', todayStr).lte('next_payment_date', threeDaysStr);
      } else if (filter.status === 'EXPIRED') {
        query = query.or('status.eq.INACTIVE,status.eq.inactive,status.eq.EXPIRED,status.eq.expired');
      }
    }

    if (filter?.sortBy) {
      const fieldMap: Record<string, string> = {
        name: 'name',
        nextPaymentDate: 'next_payment_date',
        createdAt: 'created_at',
        monthlyFee: 'monthly_fee',
      };
      query = query.order(fieldMap[filter.sortBy] || 'created_at', {
        ascending: filter.sortOrder === 'asc',
      });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id,
      gymId: m.gym_id,
      name: m.name,
      phone: m.phone,
      email: m.email || undefined,
      planName: m.plan_name,
      durationMonths: m.duration_months,
      monthlyFee: Number(m.monthly_fee),
      startDate: m.start_date,
      nextPaymentDate: m.next_payment_date,
      status: m.status as any,
      notes: m.notes || undefined,
      avatarUrl: m.avatar_url || undefined,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));
  }

  async getAttentionList(gymId: string, limit: number = 50): Promise<Member[]> {
    if (!supabase) return [];

    try {
      const { data: rpcData, error: rpcErr } = await (supabase as any).rpc('get_attention_members', {
        p_gym_id: gymId,
        p_limit: limit,
      });

      if (!rpcErr && rpcData) {
        return (rpcData || []).map((m: any) => ({
          id: m.id,
          gymId: m.gym_id,
          name: m.name,
          phone: m.phone,
          email: m.email || undefined,
          planName: m.plan_name,
          durationMonths: m.duration_months,
          monthlyFee: Number(m.monthly_fee),
          startDate: m.start_date,
          nextPaymentDate: m.next_payment_date,
          status: m.status as any,
          notes: m.notes || undefined,
          avatarUrl: m.avatar_url || undefined,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
        }));
      }
    } catch (e) {
      console.warn('RPC get_attention_members fallback:', e);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const { data, error } = await (supabase as any)
      .from('gym_members')
      .select('*')
      .eq('gym_id', gymId)
      .lte('next_payment_date', threeDaysStr)
      .or('status.eq.ACTIVE,status.eq.active')
      .order('next_payment_date', { ascending: true })
      .limit(limit);

    if (error) throw error;

    const list: Member[] = (data || []).map((m: any) => ({
      id: m.id,
      gymId: m.gym_id,
      name: m.name,
      phone: m.phone,
      email: m.email || undefined,
      planName: m.plan_name,
      durationMonths: m.duration_months,
      monthlyFee: Number(m.monthly_fee),
      startDate: m.start_date,
      nextPaymentDate: m.next_payment_date,
      status: m.status as any,
      notes: m.notes || undefined,
      avatarUrl: m.avatar_url || undefined,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    list.sort((a, b) => {
      const getPriority = (date: string) => {
        if (date < todayStr) return 1;
        if (date === todayStr) return 2;
        return 3;
      };
      const prioA = getPriority(a.nextPaymentDate);
      const prioB = getPriority(b.nextPaymentDate);
      if (prioA !== prioB) return prioA - prioB;
      return a.nextPaymentDate.localeCompare(b.nextPaymentDate);
    });

    return list;
  }

  async getMemberById(id: string): Promise<Member | null> {
    if (!supabase) return null;
    const { data } = await (supabase as any).from('gym_members').select('*').eq('id', id).maybeSingle();
    if (!data) return null;

    return {
      id: data.id,
      gymId: data.gym_id,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      planName: data.plan_name,
      durationMonths: data.duration_months,
      monthlyFee: Number(data.monthly_fee),
      startDate: data.start_date,
      nextPaymentDate: data.next_payment_date,
      status: data.status as any,
      notes: data.notes || undefined,
      avatarUrl: data.avatar_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async createMember(_clientGymId: string, member: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    if (!supabase) throw new Error('Supabase client not configured');

    // Security: Never accept arbitrary gym_id from browser payload as trusted authorization.
    // Resolve the authenticated user's permitted gym from database.
    const authUser = (await supabase.auth.getUser()).data.user;
    let trustedGymId = _clientGymId;
    if (authUser) {
      const gym = await new SupabaseGymService().getGymByOwnerId(authUser.id);
      if (gym) {
        trustedGymId = gym.id;
      }
    }

    const { data, error } = await (supabase as any)
      .from('gym_members')
      .insert({
        gym_id: trustedGymId,
        name: member.name,
        phone: member.phone,
        email: member.email || null,
        plan_name: member.planName,
        duration_months: member.durationMonths || 1,
        monthly_fee: member.monthlyFee,
        start_date: member.startDate,
        next_payment_date: member.nextPaymentDate,
        status: member.status || 'ACTIVE',
        notes: member.notes || null,
        avatar_url: member.avatarUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      planName: data.plan_name,
      durationMonths: data.duration_months,
      monthlyFee: Number(data.monthly_fee),
      startDate: data.start_date,
      nextPaymentDate: data.next_payment_date,
      status: data.status as any,
      notes: data.notes || undefined,
      avatarUrl: data.avatar_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await (supabase as any)
      .from('gym_members')
      .update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        plan_name: updates.planName,
        duration_months: updates.durationMonths,
        monthly_fee: updates.monthlyFee,
        start_date: updates.startDate,
        next_payment_date: updates.nextPaymentDate,
        status: updates.status,
        notes: updates.notes,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      planName: data.plan_name,
      durationMonths: data.duration_months,
      monthlyFee: Number(data.monthly_fee),
      startDate: data.start_date,
      nextPaymentDate: data.next_payment_date,
      status: data.status as any,
      notes: data.notes || undefined,
      avatarUrl: data.avatar_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteMember(id: string): Promise<void> {
    if (!supabase) return;
    // Business Rule: Soft-delete/Archive instead of destructive deletion to preserve financial payment ledgers
    await (supabase as any)
      .from('gym_members')
      .update({ status: 'INACTIVE', updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  async markAsPaid(
    memberId: string,
    paymentDetails: {
      amount: number;
      method: any;
      paymentDate?: string;
      notes?: string;
      durationMonths?: number;
      recordedBy?: string;
    }
  ): Promise<{ member: Member; payment: Payment }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const duration = paymentDetails.durationMonths || 1;
    const payDate = paymentDetails.paymentDate || new Date().toISOString().split('T')[0];

    const { data: txResult, error: rpcError } = await (supabase as any).rpc('record_member_payment_tx', {
      p_member_id: memberId,
      p_amount: paymentDetails.amount,
      p_payment_date: payDate,
      p_payment_method: paymentDetails.method || 'UPI',
      p_notes: paymentDetails.notes || null,
      p_duration_months: duration,
      p_recorded_by: paymentDetails.recordedBy || 'Gym Owner',
    });

    if (rpcError) {
      throw new Error(parseAuthError(rpcError));
    }

    const updatedMember = (await this.getMemberById(memberId))!;
    const payment: Payment = {
      id: txResult.payment_id,
      gymId: updatedMember.gymId,
      memberId: memberId,
      memberName: updatedMember.name,
      memberPhone: updatedMember.phone,
      amount: paymentDetails.amount,
      paymentDate: payDate,
      paymentMethod: paymentDetails.method || 'UPI',
      periodCovered: `${duration} Month Extension`,
      notes: paymentDetails.notes || undefined,
      recordedBy: paymentDetails.recordedBy || 'Gym Owner',
      createdAt: new Date().toISOString(),
    };
    return { member: updatedMember, payment };
  }
}

/**
 * @deprecated Legacy service for memberships table.
 * All member plans are canonicalized on public.gym_members table.
 */
class SupabaseMembershipService implements IMembershipService {
  async getPlans(gymId: string): Promise<MembershipPlan[]> {
    return new SupabaseGymService().getPlans(gymId);
  }
  async getPlanById(planId: string): Promise<MembershipPlan | null> {
    if (!supabase) return null;
    const { data } = await (supabase as any).from('membership_plans').select('*').eq('id', planId).maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      gymId: data.gym_id,
      name: data.name,
      durationMonths: data.duration_months,
      defaultFee: Number(data.default_fee),
      description: data.description || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }
  async createPlan(gymId: string, plan: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>): Promise<MembershipPlan> {
    return new SupabaseGymService().createPlan(gymId, plan);
  }
  async updatePlan(planId: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    return new SupabaseGymService().updatePlan(planId, updates);
  }
  async deletePlan(planId: string): Promise<void> {
    return new SupabaseGymService().deletePlan(planId);
  }
  async getMemberships(gymId: string): Promise<Membership[]> {
    if (!supabase) return [];
    const { data } = await (supabase as any).from('memberships').select('*').eq('gym_id', gymId);
    return (data || []).map((m: any) => ({
      id: m.id,
      gymId: m.gym_id,
      memberId: m.member_id,
      planId: m.plan_id || '',
      planName: m.plan_name,
      durationMonths: m.duration_months,
      feeAmount: Number(m.fee_amount),
      startDate: m.start_date,
      endDate: m.end_date,
      status: m.status as any,
      createdAt: m.created_at,
    }));
  }
  async getMemberMemberships(memberId: string): Promise<Membership[]> {
    if (!supabase) return [];
    const { data } = await (supabase as any).from('memberships').select('*').eq('member_id', memberId);
    return (data || []).map((m: any) => ({
      id: m.id,
      gymId: m.gym_id,
      memberId: m.member_id,
      planId: m.plan_id || '',
      planName: m.plan_name,
      durationMonths: m.duration_months,
      feeAmount: Number(m.fee_amount),
      startDate: m.start_date,
      endDate: m.end_date,
      status: m.status as any,
      createdAt: m.created_at,
    }));
  }
  async getActiveMembership(memberId: string): Promise<Membership | null> {
    const list = await this.getMemberMemberships(memberId);
    return list.find((m) => m.status === 'ACTIVE') || list[0] || null;
  }
  async createMembership(gymId: string, memberId: string, planId: string, details?: Partial<Membership>): Promise<Membership> {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await (supabase as any)
      .from('memberships')
      .insert({
        gym_id: gymId,
        member_id: memberId,
        plan_id: planId,
        plan_name: details?.planName || 'Standard Plan',
        duration_months: details?.durationMonths || 1,
        fee_amount: details?.feeAmount || 1500,
        start_date: details?.startDate || new Date().toISOString().split('T')[0],
        end_date: details?.endDate || new Date().toISOString().split('T')[0],
        status: details?.status || 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      memberId: data.member_id,
      planId: data.plan_id || '',
      planName: data.plan_name,
      durationMonths: data.duration_months,
      feeAmount: Number(data.fee_amount),
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status as any,
      createdAt: data.created_at,
    };
  }
  async renewMembership(membershipId: string): Promise<Membership> {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await (supabase as any)
      .from('memberships')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', membershipId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      memberId: data.member_id,
      planId: data.plan_id || '',
      planName: data.plan_name,
      durationMonths: data.duration_months,
      feeAmount: Number(data.fee_amount),
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status as any,
      createdAt: data.created_at,
    };
  }
  async cancelMembership(membershipId: string): Promise<Membership> {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await (supabase as any)
      .from('memberships')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', membershipId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      memberId: data.member_id,
      planId: data.plan_id || '',
      planName: data.plan_name,
      durationMonths: data.duration_months,
      feeAmount: Number(data.fee_amount),
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status as any,
      createdAt: data.created_at,
    };
  }
}

class SupabasePaymentService implements IPaymentService {
  async getPayments(gymId: string, filter?: IPaymentFilterOptions): Promise<Payment[]> {
    if (!supabase) return [];
    let query = (supabase as any).from('payments').select('*').eq('gym_id', gymId);

    if (filter?.search) {
      query = query.or(`member_name.ilike.%${filter.search}%,member_phone.ilike.%${filter.search}%`);
    }
    if (filter?.startDate) {
      query = query.gte('payment_date', filter.startDate);
    }
    if (filter?.endDate) {
      query = query.lte('payment_date', filter.endDate);
    }
    if (filter?.paymentMethod && filter.paymentMethod !== 'ALL') {
      query = query.eq('payment_method', filter.paymentMethod);
    }
    query = query.order('payment_date', { ascending: false }).order('created_at', { ascending: false });

    if (filter?.page && filter?.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      const end = start + filter.pageSize - 1;
      query = query.range(start, end);
    } else if (filter?.limit) {
      const offset = filter?.offset || 0;
      query = query.range(offset, offset + filter.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      gymId: p.gym_id,
      memberId: p.member_id,
      memberName: p.member_name,
      memberPhone: p.member_phone,
      amount: Number(p.amount),
      paymentDate: p.payment_date,
      paymentMethod: p.payment_method as any,
      periodCovered: p.period_covered || undefined,
      referenceNumber: p.reference_number || undefined,
      notes: p.notes || undefined,
      recordedBy: p.recorded_by || undefined,
      createdAt: p.created_at,
    }));
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    if (!supabase) return null;
    const { data } = await (supabase as any).from('payments').select('*').eq('id', id).maybeSingle();
    if (!data) return null;

    return {
      id: data.id,
      gymId: data.gym_id,
      memberId: data.member_id,
      memberName: data.member_name,
      memberPhone: data.member_phone,
      amount: Number(data.amount),
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method as any,
      periodCovered: data.period_covered || undefined,
      referenceNumber: data.reference_number || undefined,
      notes: data.notes || undefined,
      recordedBy: data.recorded_by || undefined,
      createdAt: data.created_at,
    };
  }

  async recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await (supabase as any)
      .from('payments')
      .insert({
        gym_id: payment.gymId,
        member_id: payment.memberId,
        member_name: payment.memberName,
        member_phone: payment.memberPhone,
        amount: payment.amount,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod || 'UPI',
        period_covered: payment.periodCovered || null,
        reference_number: payment.referenceNumber || null,
        notes: payment.notes || null,
        recorded_by: payment.recordedBy || 'Gym Owner',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      memberId: data.member_id,
      memberName: data.member_name,
      memberPhone: data.member_phone,
      amount: Number(data.amount),
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method as any,
      periodCovered: data.period_covered || undefined,
      referenceNumber: data.reference_number || undefined,
      notes: data.notes || undefined,
      recordedBy: data.recorded_by || undefined,
      createdAt: data.created_at,
    };
  }

  async deletePayment(id: string): Promise<void> {
    if (!supabase) return;
    await (supabase as any).from('payments').delete().eq('id', id);
  }

  async getMonthlySummary(gymId: string, year?: number, month?: number): Promise<{ totalCollected: number; transactionCount: number }> {
    const list = await this.getPayments(gymId);
    const y = year || new Date().getFullYear();
    const m = month !== undefined ? month : new Date().getMonth();
    const filtered = list.filter((p) => {
      const d = parseLocalDate(p.paymentDate);
      return d.getFullYear() === y && d.getMonth() === m;
    });

    return {
      totalCollected: filtered.reduce((sum, p) => sum + p.amount, 0),
      transactionCount: filtered.length,
    };
  }

  async getDashboardSummary(gymId: string): Promise<DashboardSummary> {
    if (supabase) {
      try {
        const { data, error } = await (supabase as any).rpc('get_dashboard_summary', {
          p_gym_id: gymId,
        });

        if (!error && data && data.length > 0) {
          const row = data[0];
          return {
            pendingCount: Number(row.pending_count || 0),
            dueSoonCount: Number(row.due_soon_count || 0),
            collectedThisMonth: Number(row.collected_this_month || 0),
            activeMembersCount: Number(row.active_members_count || 0),
          };
        }
      } catch (e) {
        console.warn('RPC get_dashboard_summary fallback:', e);
      }
    }

    const memberSvc = new SupabaseMemberService();
    const members = await memberSvc.getMembers(gymId);
    const today = new Date().toISOString().split('T')[0];

    const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
    const pendingCount = members.filter((m) => m.status === 'ACTIVE' && m.nextPaymentDate <= today).length;

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const dueSoonCount = members.filter((m) => m.status === 'ACTIVE' && m.nextPaymentDate > today && m.nextPaymentDate <= threeDaysStr).length;

    const monthlySummary = await this.getMonthlySummary(gymId);

    return {
      pendingCount,
      dueSoonCount,
      collectedThisMonth: monthlySummary.totalCollected,
      activeMembersCount,
    };
  }
}

class SupabaseReminderService implements IReminderService {
  async getReminders(gymId: string): Promise<Reminder[]> {
    if (!supabase) return [];
    const { data } = await (supabase as any)
      .from('reminders')
      .select('*')
      .eq('gym_id', gymId)
      .order('sent_at', { ascending: false });

    return (data || []).map((r: any) => ({
      id: r.id,
      gymId: r.gym_id,
      memberId: r.member_id,
      memberName: r.member_name,
      memberPhone: r.member_phone,
      amount: Number(r.amount),
      dueDate: r.due_date,
      message: r.message,
      sentAt: r.sent_at,
      channel: r.channel as any,
      status: r.status as any,
    }));
  }

  async sendReminder(dto: SendReminderDTO): Promise<SendReminderResult> {
    if (!supabase) throw new Error('Supabase client not configured');
    const memberService = new SupabaseMemberService();
    const member = await memberService.getMemberById(dto.memberId);
    if (!member) throw new Error('Member not found');

    const channel = dto.channel || 'WHATSAPP';
    const provider = MessagingProviderFactory.getProvider(channel);
    const message = dto.message || provider.formatMessage(member);

    // 1. Execute Provider Dispatcher
    const targetContact = channel === 'EMAIL' ? member.email || '' : member.phone;
    const dispatchResult = await provider.dispatch(targetContact, message);

    // 2. Persist Database Record (status reflects real provider outcome)
    const { data, error } = await (supabase as any)
      .from('reminders')
      .insert({
        gym_id: member.gymId,
        member_id: member.id,
        member_name: member.name,
        member_phone: member.phone,
        amount: dto.amount || member.monthlyFee,
        due_date: dto.dueDate || member.nextPaymentDate,
        message,
        channel,
        status: dispatchResult.status,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const reminder: Reminder = {
      id: data.id,
      gymId: data.gym_id,
      memberId: data.member_id,
      memberName: data.member_name,
      memberPhone: data.member_phone,
      amount: Number(data.amount),
      dueDate: data.due_date,
      message: data.message,
      sentAt: data.sent_at,
      channel: data.channel as any,
      status: data.status as any,
    };

    return {
      reminder,
      deepLink: dispatchResult.deepLink,
      providerRef: dispatchResult.providerRef,
    };
  }

  async logReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    const res = await this.sendReminder({
      memberId: reminder.memberId,
      channel: reminder.channel,
      message: reminder.message,
      amount: reminder.amount,
      dueDate: reminder.dueDate,
      status: reminder.status,
    });
    return res.reminder;
  }

  generateReminderMessage(member: Member, gym?: Gym | null, settings?: GymSettings | null): string {
    const provider = MessagingProviderFactory.getProvider('WHATSAPP');
    return provider.formatMessage(member, gym, settings);
  }

  generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  generateSmsLink(phone: string, message: string): string {
    return `sms:${phone}?body=${encodeURIComponent(message)}`;
  }
}

class SupabaseSettingsService implements ISettingsService {
  async getSettings(gymId: string): Promise<GymSettings> {
    if (!supabase) {
      return {
        id: 'default',
        gymId,
        currencySymbol: '₹',
        currencyCode: 'INR',
        reminderDaysBeforeDue: 3,
        defaultMonthlyFee: 1500,
        defaultMembershipDuration: '1_MONTH',
        timezone: 'Asia/Kolkata',
      };
    }

    const { data } = await (supabase as any).from('gym_settings').select('*').eq('gym_id', gymId).maybeSingle();
    if (!data) {
      return {
        id: 'default',
        gymId,
        currencySymbol: '₹',
        currencyCode: 'INR',
        reminderDaysBeforeDue: 3,
        defaultMonthlyFee: 1500,
        defaultMembershipDuration: '1_MONTH',
        timezone: 'Asia/Kolkata',
      };
    }

    return {
      id: data.id,
      gymId: data.gym_id,
      currencySymbol: data.currency_symbol,
      currencyCode: data.currency_code,
      reminderDaysBeforeDue: data.reminder_days_before_due,
      defaultMonthlyFee: Number(data.default_monthly_fee),
      defaultMembershipDuration: data.default_membership_duration as any,
      whatsappTemplate: data.whatsapp_template,
      timezone: data.timezone,
      updatedAt: data.updated_at,
    };
  }

  async updateSettings(gymId: string, updates: Partial<GymSettings>): Promise<GymSettings> {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await (supabase as any)
      .from('gym_settings')
      .upsert({
        gym_id: gymId,
        currency_symbol: updates.currencySymbol,
        currency_code: updates.currencyCode,
        reminder_days_before_due: updates.reminderDaysBeforeDue,
        default_monthly_fee: updates.defaultMonthlyFee,
        default_membership_duration: updates.defaultMembershipDuration,
        whatsapp_template: updates.whatsappTemplate,
        timezone: updates.timezone,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      gymId: data.gym_id,
      currencySymbol: data.currency_symbol,
      currencyCode: data.currency_code,
      reminderDaysBeforeDue: data.reminder_days_before_due,
      defaultMonthlyFee: Number(data.default_monthly_fee),
      defaultMembershipDuration: data.default_membership_duration as any,
      whatsappTemplate: data.whatsapp_template,
      timezone: data.timezone,
      updatedAt: data.updated_at,
    };
  }

  async resetToDefaults(gymId: string): Promise<GymSettings> {
    return this.updateSettings(gymId, {
      currencySymbol: '₹',
      currencyCode: 'INR',
      reminderDaysBeforeDue: 3,
      defaultMonthlyFee: 1500,
      defaultMembershipDuration: '1_MONTH',
      timezone: 'Asia/Kolkata',
    });
  }
}

class SupabaseAdminService implements IAdminService {
  async getStats(): Promise<PlatformStats> {
    if (!supabase) {
      return {
        totalGyms: 0,
        activeGyms: 0,
        pendingPayments: 0,
        activeSubscriptions: 0,
        pastDueSubscriptions: 0,
        cancelledSubscriptions: 0,
        mrr: 0,
        suspendedGyms: 0,
        totalMembers: 0,
      };
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        { count: totalGyms },
        { count: activeGyms },
        { count: activeSubs },
        { count: pastDueSubs },
        { count: cancelledSubs },
        { count: suspendedGyms },
        { count: totalMembers },
        { count: pendingPayments },
      ] = await Promise.all([
        (supabase as any).from('gyms').select('*', { count: 'exact', head: true }),
        (supabase as any).from('gyms').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        (supabase as any).from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        (supabase as any).from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'PAST_DUE'),
        (supabase as any).from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'CANCELLED'),
        (supabase as any).from('gyms').select('*', { count: 'exact', head: true }).eq('status', 'SUSPENDED'),
        (supabase as any).from('gym_members').select('*', { count: 'exact', head: true }),
        (supabase as any).from('gym_members').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE').lte('next_payment_date', today),
      ]);

      const activeCount = activeSubs || 0;

      return {
        totalGyms: totalGyms || 0,
        activeGyms: activeGyms || 0,
        pendingPayments: pendingPayments || 0,
        activeSubscriptions: activeCount,
        pastDueSubscriptions: pastDueSubs || 0,
        cancelledSubscriptions: cancelledSubs || 0,
        mrr: activeCount * 1999,
        suspendedGyms: suspendedGyms || 0,
        totalMembers: totalMembers || 0,
      };
    } catch (e) {
      console.warn('[ADMIN] getStats warning:', e);
      return {
        totalGyms: 0,
        activeGyms: 0,
        pendingPayments: 0,
        activeSubscriptions: 0,
        pastDueSubscriptions: 0,
        cancelledSubscriptions: 0,
        mrr: 0,
        suspendedGyms: 0,
        totalMembers: 0,
      };
    }
  }

  async getGymTenants(): Promise<PlatformGymTenant[]> {
    if (!supabase) return [];
    try {
      const { data: gyms, error: gymsErr } = await (supabase as any).from('gyms').select('*');
      if (gymsErr || !gyms) {
        console.warn('[ADMIN] getGymTenants query notice:', gymsErr);
        return [];
      }

      const { data: profiles } = await (supabase as any).from('profiles').select('id, full_name, email');
      const profileMap: Record<string, { full_name: string; email: string }> = {};
      (profiles || []).forEach((p: any) => {
        profileMap[p.id] = { full_name: p.full_name, email: p.email };
      });

      const { data: memberCounts } = await (supabase as any).from('gym_members').select('gym_id');
      const countsByGym: Record<string, number> = {};
      (memberCounts || []).forEach((m: any) => {
        countsByGym[m.gym_id] = (countsByGym[m.gym_id] || 0) + 1;
      });

      return gyms.map((g: any) => {
        const ownerProf = profileMap[g.owner_id] || profileMap[g.owner_user_id] || { full_name: 'Gym Owner', email: '' };
        return {
          id: g.id,
          name: g.name,
          ownerName: ownerProf.full_name || 'Gym Owner',
          ownerEmail: ownerProf.email || 'owner@gym.com',
          phone: g.phone,
          address: g.address || undefined,
          status: g.status as any,
          memberCount: countsByGym[g.id] || 0,
          subscriptionPlan: 'GymFlow Pro (Single Plan)',
          renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          createdAt: g.created_at,
        };
      });
    } catch (e) {
      console.error('[ADMIN] getGymTenants error:', e);
      return [];
    }
  }

  async updateGymStatus(gymId: string, status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'): Promise<PlatformGymTenant> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: gymData, error } = await (supabase as any)
      .from('gyms')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', gymId)
      .select()
      .single();

    if (error) throw error;

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('full_name, email')
      .eq('id', gymData.owner_id || gymData.owner_user_id)
      .maybeSingle();

    // Log admin action into audit_logs safely
    try {
      await (supabase as any).from('audit_logs').insert({
        gym_id: gymId,
        action: status === 'SUSPENDED' ? 'SUSPEND_GYM' : 'REACTIVATE_GYM',
        entity_type: 'GYM_TENANT',
        entity_id: gymId,
        metadata: { status, updated_at: new Date().toISOString() },
      });
    } catch {}

    return {
      id: gymData.id,
      name: gymData.name,
      ownerName: profile?.full_name || 'Gym Owner',
      ownerEmail: profile?.email || 'owner@gym.com',
      phone: gymData.phone,
      address: gymData.address || undefined,
      status: gymData.status as any,
      memberCount: 0,
      subscriptionPlan: 'GymFlow Pro (Single Plan)',
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      createdAt: gymData.created_at,
    };
  }
}

import { subscriptionService } from './subscriptionService';
import { auditService } from './auditService';

export const SupabaseContainer: IServiceContainer = {
  auth: new SupabaseAuthService(),
  gym: new SupabaseGymService(),
  members: new SupabaseMemberService(),
  memberships: new SupabaseMembershipService(),
  payments: new SupabasePaymentService(),
  reminders: new SupabaseReminderService(),
  settings: new SupabaseSettingsService(),
  subscription: subscriptionService,
  admin: new SupabaseAdminService(),
  audit: auditService,
};
