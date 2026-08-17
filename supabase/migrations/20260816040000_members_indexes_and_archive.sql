-- GymFlow Members Module Scalable Indexes and Soft-Delete Migration
-- Migration: 20260816040000_members_indexes_and_archive.sql

--------------------------------------------------------------------------------
-- 1. SEARCH INDEXES
-- Accelerates fast searching by full_name and phone scoped to gym_id
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_gym_id_name ON public.members (gym_id, full_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_members_gym_id_phone ON public.members (gym_id, phone text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_members_gym_id_status ON public.members (gym_id, status);

--------------------------------------------------------------------------------
-- 2. COMPATIBILITY TABLE / VIEW INDEXES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gym_members_gym_id_name ON public.gym_members (gym_id, name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_gym_members_gym_id_phone ON public.gym_members (gym_id, phone text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_gym_members_gym_id_status ON public.gym_members (gym_id, status);

--------------------------------------------------------------------------------
-- 3. AUDIT LOG TRIGGER ON MEMBER ARCHIVING
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_member_archive()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('inactive', 'INACTIVE', 'archived', 'ARCHIVED') AND OLD.status NOT IN ('inactive', 'INACTIVE', 'archived', 'ARCHIVED') THEN
    INSERT INTO public.audit_logs (gym_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.gym_id,
      'ARCHIVE_MEMBER',
      'MEMBER',
      NEW.id::text,
      jsonb_build_object(
        'member_name', NEW.full_name,
        'phone', NEW.phone,
        'archived_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_member_archive ON public.members;
CREATE TRIGGER trg_log_member_archive
  AFTER UPDATE OF status ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_archive();
