-- Split usage counter write-deny RLS away from SELECT.
-- This preserves client write denial while avoiding duplicate permissive SELECT policy work.

DROP POLICY IF EXISTS "usage_counters_deny_writes" ON public.usage_counters;

DROP POLICY IF EXISTS "usage_counters_deny_inserts" ON public.usage_counters;
CREATE POLICY "usage_counters_deny_inserts"
  ON public.usage_counters
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "usage_counters_deny_updates" ON public.usage_counters;
CREATE POLICY "usage_counters_deny_updates"
  ON public.usage_counters
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "usage_counters_deny_deletes" ON public.usage_counters;
CREATE POLICY "usage_counters_deny_deletes"
  ON public.usage_counters
  FOR DELETE
  USING (false);
