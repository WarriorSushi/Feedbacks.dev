-- Revocable agent setup packet tokens.
-- Tokens are signed by the app, but reads must also find a non-revoked registry row.

CREATE TABLE IF NOT EXISTS public.agent_setup_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id text NOT NULL UNIQUE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_setup_tokens_project_created
  ON public.agent_setup_tokens(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_setup_tokens_user_created
  ON public.agent_setup_tokens(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_setup_tokens_active
  ON public.agent_setup_tokens(project_id, expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.agent_setup_tokens ENABLE ROW LEVEL SECURITY;

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
        AND p.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role manages setup tokens" ON public.agent_setup_tokens;
CREATE POLICY "Service role manages setup tokens"
  ON public.agent_setup_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.agent_setup_audit
  DROP CONSTRAINT IF EXISTS agent_setup_audit_event_type_check;

ALTER TABLE public.agent_setup_audit
  ADD CONSTRAINT agent_setup_audit_event_type_check
  CHECK (event_type IN ('token_created', 'packet_read', 'token_revoked'));
