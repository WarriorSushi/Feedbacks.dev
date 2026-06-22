-- Optimize agent setup RLS ownership checks.
-- Keeps existing access semantics while wrapping auth.uid() for per-statement evaluation.

DROP POLICY IF EXISTS "Users can read agent setup audit for owned projects" ON public.agent_setup_audit;
CREATE POLICY "Users can read agent setup audit for owned projects"
  ON public.agent_setup_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = agent_setup_audit.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can read setup tokens for owned projects" ON public.agent_setup_tokens;
CREATE POLICY "Users can read setup tokens for owned projects"
  ON public.agent_setup_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = agent_setup_tokens.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );
