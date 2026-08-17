-- GymFlow First Platform Admin Bootstrap & Entitlement Hardening
-- Migration: 20260816100000_bootstrap_admin_and_entitlement.sql

--------------------------------------------------------------------------------
-- 1. SAFE ONE-TIME BOOTSTRAP FUNCTION FOR FIRST PLATFORM ADMIN
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_first_platform_admin(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_count INT;
  v_target_user_id UUID;
BEGIN
  -- Check if any platform admin already exists
  SELECT COUNT(*) INTO v_admin_count
  FROM public.profiles
  WHERE UPPER(role) = 'PLATFORM_ADMIN';

  IF v_admin_count > 0 THEN
    RAISE EXCEPTION 'Bootstrap denied: A platform administrator already exists.';
  END IF;

  -- Find user by email in profiles
  SELECT id INTO v_target_user_id
  FROM public.profiles
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  -- If not in profiles, check auth.users and create profile automatically
  IF v_target_user_id IS NULL THEN
    SELECT id INTO v_target_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(TRIM(p_email));

    IF v_target_user_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, full_name, role, updated_at)
      VALUES (v_target_user_id, p_email, 'Platform Admin', 'PLATFORM_ADMIN', NOW())
      ON CONFLICT (id) DO UPDATE SET role = 'PLATFORM_ADMIN';

      RETURN jsonb_build_object(
        'success', true,
        'promoted_user_id', v_target_user_id,
        'email', p_email,
        'role', 'PLATFORM_ADMIN'
      );
    END IF;

    RAISE EXCEPTION 'User with email % not found in auth.users or profiles. Please sign up on GymFlow first.', p_email;
  END IF;

  -- Promote user to PLATFORM_ADMIN
  UPDATE public.profiles
  SET role = 'PLATFORM_ADMIN', updated_at = NOW()
  WHERE id = v_target_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'promoted_user_id', v_target_user_id,
    'email', p_email,
    'role', 'PLATFORM_ADMIN'
  );
END;
$$;
