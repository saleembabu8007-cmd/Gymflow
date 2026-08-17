-- Fix Profile RLS, Backfill Existing Auth Users, and Update register_gym_owner RPC
-- Migration: 20260818000000_fix_profile_insert_rls_and_rpc.sql

--------------------------------------------------------------------------------
-- 1. ADD MISSING FOR INSERT POLICY ON PUBLIC.PROFILES
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

--------------------------------------------------------------------------------
-- 2. BACKFILL PROFILES FOR EXISTING AUTH USERS WHO HAVE NO PROFILE ROW
--------------------------------------------------------------------------------
INSERT INTO public.profiles (id, role, full_name, email, created_at, updated_at)
SELECT 
  u.id,
  'gym_owner',
  COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1), 'Gym Owner'),
  u.email,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- 3. RE-DEFINE ATOMIC OBOARDING RPC (Profile FIRST, Gym SECOND)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_gym_owner(
  p_owner_name TEXT,
  p_phone TEXT,
  p_gym_name TEXT,
  p_upi_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_gym_id UUID;
  v_plan_id UUID;
  v_subscription_id UUID;
  v_profile_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    v_user_email := 'owner@gymflow.app';
  END IF;

  -- 1. Upsert Profile FIRST (Satisfies fk_gyms_owner foreign key)
  INSERT INTO public.profiles (id, gym_id, role, full_name, email, phone)
  VALUES (v_user_id, NULL, 'gym_owner', p_owner_name, v_user_email, p_phone)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone
  RETURNING id INTO v_profile_id;

  -- 2. Check if user already owns a gym
  SELECT id INTO v_gym_id FROM public.gyms WHERE (owner_user_id = v_user_id OR owner_id = v_user_id) LIMIT 1;

  IF v_gym_id IS NULL THEN
    -- Create Gym (status UPPERCASE 'ACTIVE')
    INSERT INTO public.gyms (owner_id, owner_user_id, name, phone, upi_id, status)
    VALUES (v_user_id, v_user_id, p_gym_name, p_phone, p_upi_id, 'ACTIVE')
    RETURNING id INTO v_gym_id;
  END IF;

  -- 3. Update profile gym_id
  UPDATE public.profiles SET gym_id = v_gym_id WHERE id = v_user_id;

  -- 4. Fetch/Insert SaaS Plan
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE code IN ('GYMFLOW_PRO_SINGLE', 'GYMFLOW_SINGLE_PLAN') LIMIT 1;
  IF v_plan_id IS NULL THEN
    INSERT INTO public.subscription_plans (name, code, amount, price_monthly, currency)
    VALUES ('GymFlow Pro', 'GYMFLOW_PRO_SINGLE', 1999.00, 1999.00, 'INR')
    RETURNING id INTO v_plan_id;
  END IF;

  -- 5. Create SaaS Subscription
  SELECT id INTO v_subscription_id FROM public.subscriptions WHERE gym_id = v_gym_id LIMIT 1;
  IF v_subscription_id IS NULL THEN
    INSERT INTO public.subscriptions (gym_id, plan_id, status)
    VALUES (v_gym_id, v_plan_id, 'ACTIVE')
    RETURNING id INTO v_subscription_id;
  END IF;

  -- 6. Create Default Gym Settings
  INSERT INTO public.gym_settings (gym_id)
  VALUES (v_gym_id)
  ON CONFLICT (gym_id) DO NOTHING;

  -- 7. Seed Default Membership Plans
  INSERT INTO public.membership_plans (gym_id, name, duration_months, default_fee, amount, duration_days)
  VALUES 
    (v_gym_id, 'Monthly General', 1, 1500.00, 1500.00, 30),
    (v_gym_id, 'Quarterly Savings', 3, 4000.00, 4000.00, 90),
    (v_gym_id, 'Annual VIP', 12, 14000.00, 14000.00, 365)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'gym_id', v_gym_id,
    'profile_id', v_profile_id,
    'subscription_id', v_subscription_id,
    'status', 'SUCCESS'
  );
END;
$$;
