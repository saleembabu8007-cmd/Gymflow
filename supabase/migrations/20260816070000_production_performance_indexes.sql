-- GymFlow Production Performance & Index Scaling Migration
-- Migration: 20260816070000_production_performance_indexes.sql

--------------------------------------------------------------------------------
-- 1. MEMBERS & MEMBERSHIPS COMPOSITE INDEXES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_memberships_gym_status ON public.memberships (gym_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_gym_next_date_status ON public.memberships (gym_id, next_payment_date, status);
CREATE INDEX IF NOT EXISTS idx_memberships_start_end ON public.memberships (gym_id, start_date, end_date);

--------------------------------------------------------------------------------
-- 2. PAYMENTS FINANCIAL LEDGER INDEXES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_payments_gym_created ON public.payments (gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_member_date ON public.payments (gym_id, member_id, payment_date DESC);

--------------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS & AUDIT LOGS SCALING INDEXES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_gym ON public.subscriptions (status, gym_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_member_sent ON public.reminders (member_id, sent_at DESC);
