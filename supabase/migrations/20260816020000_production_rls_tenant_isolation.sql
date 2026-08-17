-- GymFlow Production PostgreSQL Row Level Security (RLS) & Multi-Tenant Isolation
-- Migration: 20260816020000_production_rls_tenant_isolation.sql

--------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS (Database-Side Resolution)
--------------------------------------------------------------------------------

-- Helper 1: Resolve authenticated user's bound gym_id directly on DB side
CREATE OR REPLACE FUNCTION public.get_auth_gym_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT gym_id FROM public.profiles WHERE id = auth.uid() AND gym_id IS NOT NULL
  UNION
  SELECT id FROM public.gyms WHERE owner_user_id = auth.uid()
  LIMIT 1;
$$;

-- Helper 2: Check if authenticated user is a Platform Admin securely on DB side
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('platform_admin', 'PLATFORM_ADMIN')
  );
$$;

--------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 3. DROP EXISTING POLICIES TO AVOID CONFLICTS
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Gym owners view own gym" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners insert own gym" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners update own gym" ON public.gyms;
DROP POLICY IF EXISTS "Tenant views own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Tenant manages own membership plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Tenant manages own members" ON public.members;
DROP POLICY IF EXISTS "Tenant manages own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Tenant manages own payments" ON public.payments;
DROP POLICY IF EXISTS "Tenant manages own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Tenant manages own settings" ON public.gym_settings;
DROP POLICY IF EXISTS "Tenant views own audit logs" ON public.audit_logs;

--------------------------------------------------------------------------------
-- 4. PROFILES POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile or Platform Admin views all"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "Users can update their own profile without role escalation"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

--------------------------------------------------------------------------------
-- 5. GYMS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Gym owners view their own gym or Platform Admin views all"
  ON public.gyms FOR SELECT
  USING (owner_user_id = auth.uid() OR id = public.get_auth_gym_id() OR public.is_platform_admin());

CREATE POLICY "Gym owners insert their own gym"
  ON public.gyms FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Gym owners update their own gym"
  ON public.gyms FOR UPDATE
  USING (owner_user_id = auth.uid() OR id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 6. SUBSCRIPTION PLANS POLICIES (Public read-only)
--------------------------------------------------------------------------------
CREATE POLICY "Authenticated users view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

--------------------------------------------------------------------------------
-- 7. SUBSCRIPTIONS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant views own SaaS subscription or Platform Admin views all"
  ON public.subscriptions FOR SELECT
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 8. MEMBERSHIP PLANS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant manages own membership plans"
  ON public.membership_plans FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 9. MEMBERS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant manages own members"
  ON public.members FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 10. MEMBERSHIPS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant manages own member memberships"
  ON public.memberships FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 11. PAYMENTS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant manages own payment ledger"
  ON public.payments FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 12. REMINDERS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant manages own reminders"
  ON public.reminders FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 13. GYM SETTINGS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant manages own settings"
  ON public.gym_settings FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 14. AUDIT LOGS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "Tenant views own audit logs or Platform Admin views all"
  ON public.audit_logs FOR SELECT
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

CREATE POLICY "Tenant inserts own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());
