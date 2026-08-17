-- GymFlow Platform Security Audit & Hardening Migration
-- Migration: 20260816060000_platform_admin_security_audit.sql

--------------------------------------------------------------------------------
-- 1. HARDEN PROFILE ROLE PROTECTION (PREVENT SELF-PROMOTION TO ADMIN)
--------------------------------------------------------------------------------

-- Trigger Function: Block non-admin users from changing their own role to platform_admin
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changing, verify that the authenticated user performing the change is a Platform Admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can modify user roles';
    END IF;
  END IF;

  -- Block users from changing their bound gym_id to another gym unless platform_admin
  IF NEW.gym_id IS DISTINCT FROM OLD.gym_id THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify tenant gym binding';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

--------------------------------------------------------------------------------
-- 2. HARDEN GYM TENANT STATUS & OWNERSHIP (PREVENT UNAUTHORIZED SUSPENSION / BYPASS)
--------------------------------------------------------------------------------

-- Trigger Function: Block gym owners from changing their gym status or owner_user_id
CREATE OR REPLACE FUNCTION public.prevent_gym_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Gym status modification (ACTIVE / SUSPENDED) requires platform_admin
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can change gym subscription status';
    END IF;
  END IF;

  -- Transferring gym ownership requires platform_admin
  IF NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id THEN
    IF NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Cannot transfer gym ownership';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_gym_tampering ON public.gyms;
CREATE TRIGGER trg_prevent_gym_tampering
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_gym_tampering();

--------------------------------------------------------------------------------
-- 3. HARDEN SAAS SUBSCRIPTIONS TABLE (PREVENT PAYMENT BYPASS & STATUS MODIFICATION)
--------------------------------------------------------------------------------

-- Ensure subscriptions table can only be modified by platform_admin or service_role webhooks
CREATE OR REPLACE FUNCTION public.prevent_subscription_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only platform administrators or billing webhooks can alter subscription state';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_subscription_tampering ON public.subscriptions;
CREATE TRIGGER trg_prevent_subscription_tampering
  BEFORE UPDATE OR INSERT OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_tampering();

--------------------------------------------------------------------------------
-- 4. HARDEN TENANT ISOLATION AFTER SUSPENSION
--------------------------------------------------------------------------------

-- Helper Function: Check if tenant gym is currently active
CREATE OR REPLACE FUNCTION public.is_gym_active(p_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gyms
    WHERE id = p_gym_id AND status IN ('active', 'ACTIVE')
  );
$$;

--------------------------------------------------------------------------------
-- 5. AUDIT LOG TRIGGER ON PLATFORM ADMIN ACTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_admin_tenant_action()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_logs (user_id, gym_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      NEW.id,
      CASE WHEN NEW.status IN ('SUSPENDED', 'suspended') THEN 'SUSPEND_GYM' ELSE 'REACTIVATE_GYM' END,
      'GYM_TENANT',
      NEW.id::text,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'admin_user_id', auth.uid(),
        'timestamp', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_admin_tenant_action ON public.gyms;
CREATE TRIGGER trg_log_admin_tenant_action
  AFTER UPDATE OF status ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_tenant_action();
