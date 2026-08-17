-- GymFlow Multi-Tenant Security & RLS Hardening
-- Migration: 20260816080000_multi_tenant_security_hardening.sql

--------------------------------------------------------------------------------
-- 1. HARDEN SECURITY DEFINER FUNCTIONS (Explicit search_path & NULL checks)
--------------------------------------------------------------------------------

-- 1.1 Helper: Resolve authenticated user's bound gym_id
CREATE OR REPLACE FUNCTION public.get_auth_gym_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT gym_id FROM public.profiles WHERE id = auth.uid() AND gym_id IS NOT NULL
  UNION
  SELECT id FROM public.gyms WHERE (owner_user_id = auth.uid() OR owner_id = auth.uid()) AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

-- 1.2 Helper: Check if authenticated user is a Platform Admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND UPPER(role) IN ('PLATFORM_ADMIN')
  );
$$;

-- 1.3 Helper: Check if tenant gym is active
CREATE OR REPLACE FUNCTION public.is_gym_active(p_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gyms
    WHERE id = p_gym_id AND UPPER(status) = 'ACTIVE'
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
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 3. HARDEN RLS POLICIES (EXPLICIT TENANT ISOLATION)
--------------------------------------------------------------------------------

-- 3.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile or Platform Admin views all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile without role escalation" ON public.profiles;

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

-- 3.2 GYMS POLICIES
DROP POLICY IF EXISTS "Gym owners view their own gym or Platform Admin views all" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners insert their own gym" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners update their own gym" ON public.gyms;

CREATE POLICY "Gym owners view their own gym or Platform Admin views all"
  ON public.gyms FOR SELECT
  USING (
    owner_user_id = auth.uid() 
    OR owner_id = auth.uid() 
    OR id = public.get_auth_gym_id() 
    OR public.is_platform_admin()
  );

CREATE POLICY "Gym owners insert their own gym"
  ON public.gyms FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid() OR owner_id = auth.uid() OR public.is_platform_admin()
  );

CREATE POLICY "Gym owners update their own gym"
  ON public.gyms FOR UPDATE
  USING (
    owner_user_id = auth.uid() 
    OR owner_id = auth.uid() 
    OR id = public.get_auth_gym_id() 
    OR public.is_platform_admin()
  );

-- 3.3 SUBSCRIPTION PLANS POLICIES (Public read-only for authenticated users)
DROP POLICY IF EXISTS "Authenticated users view active subscription plans" ON public.subscription_plans;

CREATE POLICY "Authenticated users view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3.4 SUBSCRIPTIONS POLICIES
DROP POLICY IF EXISTS "Tenant views own SaaS subscription or Platform Admin views all" ON public.subscriptions;

CREATE POLICY "Tenant views own SaaS subscription or Platform Admin views all"
  ON public.subscriptions FOR SELECT
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.5 MEMBERSHIP PLANS POLICIES
DROP POLICY IF EXISTS "Tenant manages own membership plans" ON public.membership_plans;

CREATE POLICY "Tenant manages own membership plans"
  ON public.membership_plans FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.6 MEMBERS & GYM_MEMBERS POLICIES
DROP POLICY IF EXISTS "Tenant manages own members" ON public.members;
DROP POLICY IF EXISTS "Member tenant access" ON public.gym_members;
DROP POLICY IF EXISTS "Tenant manages own gym_members" ON public.gym_members;

CREATE POLICY "Tenant manages own members"
  ON public.members FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

CREATE POLICY "Tenant manages own gym_members"
  ON public.gym_members FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.7 MEMBERSHIPS POLICIES
DROP POLICY IF EXISTS "Tenant manages own member memberships" ON public.memberships;

CREATE POLICY "Tenant manages own member memberships"
  ON public.memberships FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.8 PAYMENTS POLICIES
DROP POLICY IF EXISTS "Tenant manages own payment ledger" ON public.payments;

CREATE POLICY "Tenant manages own payment ledger"
  ON public.payments FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.9 REMINDERS POLICIES
DROP POLICY IF EXISTS "Tenant manages own reminders" ON public.reminders;

CREATE POLICY "Tenant manages own reminders"
  ON public.reminders FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.10 GYM SETTINGS POLICIES
DROP POLICY IF EXISTS "Tenant manages own settings" ON public.gym_settings;

CREATE POLICY "Tenant manages own settings"
  ON public.gym_settings FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin())
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.11 AUDIT LOGS POLICIES (Append-only for tenants; NO UPDATE OR DELETE)
DROP POLICY IF EXISTS "Tenant views own audit logs or Platform Admin views all" ON public.audit_logs;
DROP POLICY IF EXISTS "Tenant inserts own audit logs" ON public.audit_logs;

CREATE POLICY "Tenant views own audit logs or Platform Admin views all"
  ON public.audit_logs FOR SELECT
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

CREATE POLICY "Tenant inserts own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

--------------------------------------------------------------------------------
-- 4. TRIGGER HARDENING (PREVENT ROLE ESCALATION & GYM TAMPERING)
--------------------------------------------------------------------------------

-- 4.1 Prevent role & tenant binding tampering on Profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can modify user roles';
    END IF;
  END IF;

  IF NEW.gym_id IS DISTINCT FROM OLD.gym_id THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify tenant gym binding';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 4.2 Prevent status & ownership tampering on Gyms
CREATE OR REPLACE FUNCTION public.prevent_gym_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can change gym subscription status';
    END IF;
  END IF;

  IF (NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id) OR (NEW.owner_id IS DISTINCT FROM OLD.owner_id) THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Cannot transfer gym ownership';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_gym_tampering ON public.gyms;
CREATE TRIGGER trg_prevent_gym_tampering
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_gym_tampering();

-- 4.3 Prevent SaaS Subscription tampering
CREATE OR REPLACE FUNCTION public.prevent_subscription_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only platform administrators or billing webhooks can alter subscription state';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_subscription_tampering ON public.subscriptions;
CREATE TRIGGER trg_prevent_subscription_tampering
  BEFORE UPDATE OR INSERT OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_tampering();
