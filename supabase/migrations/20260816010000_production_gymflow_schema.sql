-- GymFlow Production Multi-Tenant Database Schema
-- Migration: 20260816010000_production_gymflow_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- 1. PROFILES (Authenticated Users)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('platform_admin', 'gym_owner', 'staff')) DEFAULT 'gym_owner',
  gym_id UUID, -- Back-reference to current tenant gym
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-------------------------------------------------------
-- 2. GYMS (Tenant Root Entity)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  phone TEXT NOT NULL,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for gyms
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gyms' AND column_name = 'owner_id') THEN
    UPDATE public.gyms SET owner_user_id = owner_id WHERE owner_user_id IS NULL;
  END IF;
END $$;

-- Foreign Key constraint on profiles gym_id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_gym;
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_gym FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE SET NULL;

-------------------------------------------------------
-- 3. SUBSCRIPTION PLANS (Single Plan in v1)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for subscription_plans
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2);
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.subscription_plans ALTER COLUMN price_monthly DROP NOT NULL;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscription_plans' AND column_name = 'price_monthly') THEN
    UPDATE public.subscription_plans SET amount = price_monthly WHERE amount IS NULL;
    UPDATE public.subscription_plans SET price_monthly = amount WHERE price_monthly IS NULL;
  END IF;
END $$;

-- Seed Single SaaS Plan
INSERT INTO public.subscription_plans (name, code, amount, price_monthly, currency, features)
VALUES (
  'GymFlow Pro',
  'GYMFLOW_PRO_SINGLE',
  1999.00,
  1999.00,
  'INR',
  '["Unlimited Members", "WhatsApp Payment Reminders", "Payment Collection Ledger", "UPI QR Codes", "Multi-Device Access"]'::jsonb
) ON CONFLICT (code) DO NOTHING;

-------------------------------------------------------
-- 4. SUBSCRIPTIONS (Tenant Gym Subscriptions)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'expired', 'pending')) DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  cancelled_at TIMESTAMPTZ,
  provider TEXT DEFAULT 'MANUAL',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'MANUAL';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT;

-------------------------------------------------------
-- 5. MEMBERSHIP PLANS (Per-Gym Customer Plans)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  amount NUMERIC(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for membership_plans
ALTER TABLE public.membership_plans ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.membership_plans ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2);
ALTER TABLE public.membership_plans ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'membership_plans' AND column_name = 'default_fee') THEN
    ALTER TABLE public.membership_plans ALTER COLUMN default_fee DROP NOT NULL;
    UPDATE public.membership_plans SET amount = default_fee WHERE amount IS NULL;
  END IF;
END $$;

-------------------------------------------------------
-- 6. MEMBERS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-------------------------------------------------------
-- 7. MEMBERSHIPS (Member Subscription Ledger)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  next_payment_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for memberships
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS next_payment_date DATE;
UPDATE public.memberships SET next_payment_date = end_date WHERE next_payment_date IS NULL;

-------------------------------------------------------
-- 8. PAYMENTS (Financial Ledger)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER')) DEFAULT 'UPI',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL;

-------------------------------------------------------
-- 9. REMINDERS (Communication Log)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP', 'SMS', 'EMAIL', 'MANUAL')) DEFAULT 'WHATSAPP',
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SENT', 'FAILED', 'PENDING')) DEFAULT 'SENT',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for reminders
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-------------------------------------------------------
-- 10. GYM SETTINGS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL UNIQUE REFERENCES public.gyms(id) ON DELETE CASCADE,
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  reminder_days_before_due INTEGER NOT NULL DEFAULT 3,
  default_membership_duration TEXT NOT NULL DEFAULT '1_MONTH',
  whatsapp_template TEXT NOT NULL DEFAULT 'Hi {full_name}, your gym membership fee of {amount} is due on {due_date}. Please pay via UPI to keep your access active. Thank you! - {gym_name}',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-------------------------------------------------------
-- 11. AUDIT LOGS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema alignment for audit_logs
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'actor_id') THEN
    UPDATE public.audit_logs SET user_id = actor_id WHERE user_id IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'details') THEN
    UPDATE public.audit_logs SET metadata = details WHERE metadata = '{}'::jsonb OR metadata IS NULL;
  END IF;
END $$;

-------------------------------------------------------
-- 12. INDEXES
-------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gyms_owner ON public.gyms(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_members_gym ON public.members(gym_id);
CREATE INDEX IF NOT EXISTS idx_memberships_gym_member ON public.memberships(gym_id, member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_next_payment ON public.memberships(gym_id, next_payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_gym_date ON public.payments(gym_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_reminders_gym ON public.reminders(gym_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_gym ON public.subscriptions(gym_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_gym ON public.audit_logs(gym_id);

