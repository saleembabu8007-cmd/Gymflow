-- GymFlow Dashboard Aggregations & Attention Views
-- Migration: 20260816030000_dashboard_summary_views.sql

--------------------------------------------------------------------------------
-- 1. FUNCTION: get_dashboard_summary(p_gym_id UUID)
-- Computes indexed summary metrics directly inside PostgreSQL for maximum performance
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_gym_id UUID DEFAULT NULL)
RETURNS TABLE (
  pending_count BIGINT,
  due_soon_count BIGINT,
  collected_this_month NUMERIC,
  active_members_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_gym_id UUID;
  v_start_of_month DATE;
BEGIN
  -- Enforce RLS security check on gym_id
  v_gym_id := public.get_auth_gym_id();
  IF p_gym_id IS NOT NULL AND p_gym_id != v_gym_id AND NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Unauthorized access to tenant dashboard summary';
  END IF;

  IF p_gym_id IS NOT NULL THEN
    v_gym_id := p_gym_id;
  END IF;

  v_start_of_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  RETURN QUERY
  SELECT
    -- Pending Count: Overdue (next_payment_date < TODAY) + Due Today (next_payment_date = TODAY)
    (
      SELECT COUNT(*)
      FROM public.gym_members gm
      WHERE gm.gym_id = v_gym_id
        AND UPPER(gm.status) = 'ACTIVE'
        AND gm.next_payment_date <= CURRENT_DATE
    )::BIGINT AS pending_count,

    -- Due Soon Count: Next 3 days (next_payment_date > TODAY AND <= TODAY + 3 days)
    (
      SELECT COUNT(*)
      FROM public.gym_members gm
      WHERE gm.gym_id = v_gym_id
        AND UPPER(gm.status) = 'ACTIVE'
        AND gm.next_payment_date > CURRENT_DATE
        AND gm.next_payment_date <= (CURRENT_DATE + INTERVAL '3 days')::DATE
    )::BIGINT AS due_soon_count,

    -- Collected This Month: SUM(amount) for current month
    COALESCE(
      (
        SELECT SUM(p.amount)
        FROM public.payments p
        WHERE p.gym_id = v_gym_id
          AND p.payment_date >= v_start_of_month
      ),
      0.00
    ) AS collected_this_month,

    -- Active Members Count
    (
      SELECT COUNT(*)
      FROM public.gym_members gm
      WHERE gm.gym_id = v_gym_id
        AND UPPER(gm.status) = 'ACTIVE'
    )::BIGINT AS active_members_count;
END;
$$;

--------------------------------------------------------------------------------
-- 2. FUNCTION: get_attention_members(p_gym_id UUID, p_limit INT)
-- Fetches prioritized attention records (Overdue -> Due Today -> Due Soon)
-- directly from DB with RLS protection and index support.
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_attention_members(p_gym_id UUID DEFAULT NULL, p_limit INT DEFAULT 50)
RETURNS SETOF public.gym_members
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_gym_id UUID;
BEGIN
  v_gym_id := public.get_auth_gym_id();
  IF p_gym_id IS NOT NULL AND p_gym_id != v_gym_id AND NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Unauthorized access to tenant attention list';
  END IF;

  IF p_gym_id IS NOT NULL THEN
    v_gym_id := p_gym_id;
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.gym_members gm
  WHERE gm.gym_id = v_gym_id
    AND UPPER(gm.status) = 'ACTIVE'
    AND gm.next_payment_date <= (CURRENT_DATE + INTERVAL '3 days')::DATE
  ORDER BY
    CASE
      WHEN gm.next_payment_date < CURRENT_DATE THEN 1
      WHEN gm.next_payment_date = CURRENT_DATE THEN 2
      ELSE 3
    END ASC,
    gm.next_payment_date ASC
  LIMIT COALESCE(p_limit, 50);
END;
$$;

