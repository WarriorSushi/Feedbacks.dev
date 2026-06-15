-- Agent setup packet audit log.
-- Tracks short-lived setup packet link creation and reads without storing token values.

CREATE TABLE IF NOT EXISTS public.agent_setup_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('token_created', 'packet_read')),
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_setup_audit_project_created
  ON public.agent_setup_audit(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_setup_audit_user_created
  ON public.agent_setup_audit(user_id, created_at DESC);

ALTER TABLE public.agent_setup_audit ENABLE ROW LEVEL SECURITY;

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
        AND p.owner_user_id = auth.uid()
    )
  );

-- Writes are service-role only through dashboard API routes.
DROP POLICY IF EXISTS "Service role writes agent setup audit" ON public.agent_setup_audit;
CREATE POLICY "Service role writes agent setup audit"
  ON public.agent_setup_audit
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
