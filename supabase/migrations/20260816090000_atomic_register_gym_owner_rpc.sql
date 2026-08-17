-- GymFlow Atomic & Idempotent Gym Owner Onboarding RPC
-- Migration: 20260816090000_atomic_register_gym_owner_rpc.sql

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

  -- 0. Check if user already owns a gym (Idempotency check)
  SELECT id INTO v_gym_id FROM public.gyms WHERE (owner_user_id = v_user_id OR owner_id = v_user_id) LIMIT 1;
  
  IF v_gym_id IS NOT NULL THEN
    -- Ensure profile gym_id is linked
    UPDATE public.profiles SET gym_id = v_gym_id WHERE id = v_user_id AND gym_id IS NULL;
    SELECT id INTO v_profile_id FROM public.profiles WHERE id = v_user_id;
    SELECT id INTO v_subscription_id FROM public.subscriptions WHERE gym_id = v_gym_id LIMIT 1;
    RETURN jsonb_build_object(
      'gym_id', v_gym_id,
      'profile_id', v_profile_id,
      'subscription_id', v_subscription_id,
      'status', 'EXISTING'
    );
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    v_user_email := 'owner@gymflow.app';
  END IF;

  -- 1. Create Gym
  INSERT INTO public.gyms (owner_id, owner_user_id, name, phone, upi_id, status)
  VALUES (v_user_id, v_user_id, p_gym_name, p_phone, p_upi_id, 'active')
  RETURNING id INTO v_gym_id;

  -- 2. Upsert Profile (Enforcing gym_owner role, preventing platform_admin self-promotion)
  INSERT INTO public.profiles (id, gym_id, role, full_name, email, phone)
  VALUES (v_user_id, v_gym_id, 'gym_owner', p_owner_name, v_user_email, p_phone)
  ON CONFLICT (id) DO UPDATE SET
    gym_id = EXCLUDED.gym_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone
  RETURNING id INTO v_profile_id;

  -- 3. Fetch Single SaaS Plan
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE code IN ('GYMFLOW_PRO_SINGLE', 'GYMFLOW_SINGLE_PLAN') LIMIT 1;
  IF v_plan_id IS NULL THEN
    INSERT INTO public.subscription_plans (name, code, amount, price_monthly, currency)
    VALUES ('GymFlow Pro', 'GYMFLOW_PRO_SINGLE', 1999.00, 1999.00, 'INR')
    RETURNING id INTO v_plan_id;
  END IF;

  -- 4. Create Active SaaS Subscription
  INSERT INTO public.subscriptions (gym_id, plan_id, status)
  VALUES (v_gym_id, v_plan_id, 'active')
  RETURNING id INTO v_subscription_id;

  -- 5. Create Default Gym Settings
  INSERT INTO public.gym_settings (gym_id)
  VALUES (v_gym_id)
  ON CONFLICT (gym_id) DO NOTHING;

  -- 6. Seed Default Membership Plans for new Gym
  INSERT INTO public.membership_plans (gym_id, name, duration_months, default_fee, amount, duration_days)
  VALUES 
    (v_gym_id, 'Monthly General', 1, 1500.00, 1500.00, 30),
    (v_gym_id, 'Quarterly Savings', 3, 4000.00, 4000.00, 90),
    (v_gym_id, 'Annual VIP', 12, 14000.00, 14000.00, 365);

  RETURN jsonb_build_object(
    'gym_id', v_gym_id,
    'profile_id', v_profile_id,
    'subscription_id', v_subscription_id,
    'status', 'SUCCESS'
  );
END;
$$;
