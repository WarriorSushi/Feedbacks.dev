-- 019_feedback_read_state_backfill.sql
-- Existing triaged feedback should not appear unread after read_at is introduced.

UPDATE public.feedback
SET read_at = COALESCE(updated_at, created_at, now())
WHERE read_at IS NULL
  AND status <> 'new';
