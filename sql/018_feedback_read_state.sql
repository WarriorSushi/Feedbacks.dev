-- 018_feedback_read_state.sql
-- Separate inbox read state from workflow status.

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS read_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_unread_project_created
  ON public.feedback(project_id, created_at DESC)
  WHERE read_at IS NULL AND is_archived = false;

CREATE OR REPLACE FUNCTION public.touch_feedback_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (to_jsonb(NEW) - 'read_at' - 'updated_at') IS NOT DISTINCT FROM
     (to_jsonb(OLD) - 'read_at' - 'updated_at') THEN
    NEW.updated_at = OLD.updated_at;
  ELSE
    NEW.updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_feedback_updated_at ON public.feedback;

CREATE TRIGGER trg_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.touch_feedback_updated_at();

REVOKE EXECUTE ON FUNCTION public.touch_feedback_updated_at() FROM public, anon, authenticated;
