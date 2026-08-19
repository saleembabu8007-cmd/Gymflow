-- GymFlow Schema Consolidation & Deprecation Migration
-- Migration: 20260819000000_deprecate_legacy_tables.sql

--------------------------------------------------------------------------------
-- 1. DEPRECATION COMMENTS ON LEGACY UNUSED TABLES
-- Formally marks public.members and public.memberships as deprecated in schema.
-- public.gym_members is the single canonical table for all member data.
--------------------------------------------------------------------------------
COMMENT ON TABLE public.members IS 'DEPRECATED: Unused legacy table. Use public.gym_members as the canonical member table.';
COMMENT ON TABLE public.memberships IS 'DEPRECATED: Unused legacy table. Member plan details are embedded directly in public.gym_members.';

--------------------------------------------------------------------------------
-- 2. REFINE RECORD_MEMBER_PAYMENT_TX RPC
-- Removes redundant fallback queries/updates to deprecated members and memberships tables.
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_member_payment_tx(
  p_member_id UUID,
  p_amount NUMERIC,
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_payment_method TEXT DEFAULT 'UPI',
  p_notes TEXT DEFAULT NULL,
  p_duration_months INT DEFAULT 1,
  p_recorded_by TEXT DEFAULT 'Gym Owner'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gym_id UUID;
  v_auth_gym_id UUID;
  v_member_name TEXT;
  v_member_phone TEXT;
  v_current_next_date DATE;
  v_base_date DATE;
  v_new_next_date DATE;
  v_payment_id UUID;
  v_duration INT;
BEGIN
  -- 1. Resolve & Enforce Tenant Gym Ownership Security
  v_auth_gym_id := public.get_auth_gym_id();

  SELECT gm.gym_id, gm.name, gm.phone, gm.next_payment_date
  INTO v_gym_id, v_member_name, v_member_phone, v_current_next_date
  FROM public.gym_members gm
  WHERE gm.id = p_member_id;

  IF v_gym_id IS NULL THEN
    RAISE EXCEPTION 'Member with ID % not found in gym_members', p_member_id;
  END IF;

  IF v_gym_id != v_auth_gym_id AND NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Unauthorized payment recording attempt for another gym';
  END IF;

  -- 2. Input Validations
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;

  IF p_payment_method IS NULL OR LENGTH(TRIM(p_payment_method)) = 0 THEN
    RAISE EXCEPTION 'Payment method is required';
  END IF;

  v_duration := GREATEST(1, COALESCE(p_duration_months, 1));

  -- 3. Calculate New Next Payment Date
  v_base_date := GREATEST(COALESCE(v_current_next_date, p_payment_date), p_payment_date);
  v_new_next_date := (v_base_date + (v_duration || ' months')::INTERVAL)::DATE;

  -- 4. ATOMIC DATABASE MUTATIONS
  
  -- Step A: Insert Payment Record
  INSERT INTO public.payments (
    gym_id,
    member_id,
    member_name,
    member_phone,
    amount,
    payment_date,
    payment_method,
    period_covered,
    notes,
    recorded_by
  )
  VALUES (
    v_gym_id,
    p_member_id,
    v_member_name,
    v_member_phone,
    p_amount,
    p_payment_date,
    UPPER(REPLACE(TRIM(p_payment_method), ' ', '_')),
    (v_duration || CASE WHEN v_duration = 1 THEN ' Month Extension' ELSE ' Months Extension' END),
    p_notes,
    p_recorded_by
  )
  RETURNING id INTO v_payment_id;

  -- Step B: Update canonical gym_members State
  UPDATE public.gym_members
  SET
    next_payment_date = v_new_next_date,
    status = 'ACTIVE',
    updated_at = NOW()
  WHERE id = p_member_id;

  -- Step C: Insert Audit Log Record
  INSERT INTO public.audit_logs (
    gym_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    v_gym_id,
    'RECORD_MEMBER_PAYMENT',
    'PAYMENT',
    v_payment_id::TEXT,
    jsonb_build_object(
      'member_id', p_member_id,
      'member_name', v_member_name,
      'amount', p_amount,
      'payment_method', p_payment_method,
      'payment_date', p_payment_date,
      'new_next_payment_date', v_new_next_date
    )
  );

  -- Return Result Summary
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'member_id', p_member_id,
    'member_name', v_member_name,
    'amount', p_amount,
    'new_next_payment_date', v_new_next_date,
    'status', 'ACTIVE'
  );
END;
$$;
