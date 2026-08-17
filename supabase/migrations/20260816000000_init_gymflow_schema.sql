-- GymFlow Production Multi-Tenant Schema & Row Level Security (RLS)
-- Migration: 20260816000000_init_gymflow_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- 1. TABLES
-------------------------------------------------------

-- 1.1 Gyms (Tenant Root Entity)
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  upi_id TEXT,
  logo_url TEXT,
  status TEXT CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('PLATFORM_ADMIN', 'GYM_OWNER', 'STAFF')) DEFAULT 'GYM_OWNER',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Foreign key constraint to gyms owner_id referencing profiles
ALTER TABLE public.gyms DROP CONSTRAINT IF EXISTS fk_gyms_owner;
ALTER TABLE public.gyms ADD CONSTRAINT fk_gyms_owner FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

-- 1.3 Platform Subscription Plans (Single Plan in v1)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Default Single SaaS Plan for Gym Owners
INSERT INTO public.subscription_plans (name, code, price_monthly, currency, features)
VALUES (
  'GymFlow Pro',
  'GYMFLOW_SINGLE_PLAN',
  1999.00,
  'INR',
  '["Unlimited Members", "WhatsApp Reminders", "Payment Ledger", "UPI QR Collection", "Analytics", "Multi-device Access"]'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- 1.4 SaaS Subscriptions (Gym Tenant Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED')) DEFAULT 'ACTIVE',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 Membership Plans (Per-Gym member plan templates)
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  default_fee NUMERIC(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.6 Gym Members
CREATE TABLE IF NOT EXISTS public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  monthly_fee NUMERIC(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  next_payment_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.7 Member Subscriptions Ledger
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  fee_amount NUMERIC(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.8 Payments Ledger
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_phone TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER')) DEFAULT 'UPI',
  period_covered TEXT,
  reference_number TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.9 Reminders Log
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_phone TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP', 'SMS', 'EMAIL', 'MANUAL')) DEFAULT 'WHATSAPP',
  status TEXT NOT NULL CHECK (status IN ('SENT', 'FAILED', 'PENDING')) DEFAULT 'SENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.10 Gym Settings
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE CASCADE,
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  currency_code TEXT NOT NULL DEFAULT 'INR',
  reminder_days_before_due INTEGER NOT NULL DEFAULT 3,
  default_monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 1500,
  default_membership_duration TEXT NOT NULL DEFAULT '1_MONTH',
  whatsapp_template TEXT NOT NULL DEFAULT 'Hi {member_name}, your gym membership fee of {amount} is due on {due_date}. Please pay via UPI ({upi_id}) to keep your membership active. Thank you! - {gym_name}',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.11 Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-------------------------------------------------------
-- 2. INDEXES
-------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_gym_id ON public.profiles(gym_id);
CREATE INDEX IF NOT EXISTS idx_gyms_owner_id ON public.gyms(owner_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_gym_id ON public.gym_members(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_next_payment ON public.gym_members(gym_id, next_payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON public.payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(gym_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_reminders_gym_id ON public.reminders(gym_id);

-------------------------------------------------------
-- 3. HELPER FUNCTIONS & RLS SECURITY POLICIES
-------------------------------------------------------

-- Helper: Get gym_id for current authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_gym_id()
RETURNS UUID AS $$
  SELECT gym_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'PLATFORM_ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable Row Level Security (RLS) on all tenant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles RLS
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "Users can update own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_platform_admin());

-- 3.2 Gyms RLS
CREATE POLICY "Gym tenant access"
  ON public.gyms FOR ALL
  USING (owner_id = auth.uid() OR id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.3 Gym Members RLS
CREATE POLICY "Member tenant access"
  ON public.gym_members FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.4 Payments RLS
CREATE POLICY "Payments tenant access"
  ON public.payments FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.5 Reminders RLS
CREATE POLICY "Reminders tenant access"
  ON public.reminders FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.6 Gym Settings RLS
CREATE POLICY "Settings tenant access"
  ON public.gym_settings FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.7 Memberships RLS
CREATE POLICY "Memberships tenant access"
  ON public.memberships FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.8 Membership Plans RLS
CREATE POLICY "Membership plans tenant access"
  ON public.membership_plans FOR ALL
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-- 3.9 Subscriptions RLS
CREATE POLICY "Subscriptions view policy"
  ON public.subscriptions FOR SELECT
  USING (gym_id = public.get_auth_gym_id() OR public.is_platform_admin());

-------------------------------------------------------
-- 4. ATOMIC SELF-SERVICE REGISTRATION RPC
-------------------------------------------------------

CREATE OR REPLACE FUNCTION public.register_gym_owner(
  p_owner_name TEXT,
  p_phone TEXT,
  p_gym_name TEXT,
  p_upi_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
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

  -- 1. Create Gym
  INSERT INTO public.gyms (owner_id, name, phone, upi_id)
  VALUES (v_user_id, p_gym_name, p_phone, p_upi_id)
  RETURNING id INTO v_gym_id;

  -- 2. Upsert Profile
  INSERT INTO public.profiles (id, gym_id, role, full_name, email, phone)
  VALUES (v_user_id, v_gym_id, 'GYM_OWNER', p_owner_name, v_user_email, p_phone)
  ON CONFLICT (id) DO UPDATE SET
    gym_id = EXCLUDED.gym_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone
  RETURNING id INTO v_profile_id;

  -- 3. Fetch Single SaaS Plan
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE code = 'GYMFLOW_SINGLE_PLAN' LIMIT 1;
  IF v_plan_id IS NULL THEN
    INSERT INTO public.subscription_plans (name, code, price_monthly, currency)
    VALUES ('GymFlow Pro', 'GYMFLOW_SINGLE_PLAN', 1999.00, 'INR')
    RETURNING id INTO v_plan_id;
  END IF;

  -- 4. Create Active SaaS Subscription
  INSERT INTO public.subscriptions (gym_id, plan_id, status)
  VALUES (v_gym_id, v_plan_id, 'ACTIVE')
  RETURNING id INTO v_subscription_id;

  -- 5. Create Default Gym Settings
  INSERT INTO public.gym_settings (gym_id)
  VALUES (v_gym_id)
  ON CONFLICT (gym_id) DO NOTHING;

  -- 6. Seed Default Membership Plans for new Gym
  INSERT INTO public.membership_plans (gym_id, name, duration_months, default_fee)
  VALUES 
    (v_gym_id, 'Monthly General', 1, 1500.00),
    (v_gym_id, 'Quarterly Savings', 3, 4000.00),
    (v_gym_id, 'Annual VIP', 12, 14000.00);

  RETURN jsonb_build_object(
    'gym_id', v_gym_id,
    'profile_id', v_profile_id,
    'subscription_id', v_subscription_id,
    'status', 'SUCCESS'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
