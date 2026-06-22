-- Durable webhook digest queue.
-- Stores feedback events for endpoints configured with daily digest delivery.

CREATE TABLE IF NOT EXISTS public.webhook_digest_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('slack', 'discord', 'generic', 'github')),
  endpoint_id text,
  endpoint_url text NOT NULL,
  event text NOT NULL DEFAULT 'feedback.new',
  payload jsonb NOT NULL,
  digest_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'retrying', 'succeeded', 'failed')),
  attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0),
  max_attempts integer NOT NULL DEFAULT 4 CHECK (max_attempts > 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  last_error text,
  last_delivery_id uuid REFERENCES public.webhook_deliveries(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_digest_items_status_next_attempt
  ON public.webhook_digest_items(status, next_attempt_at ASC, digest_date ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_webhook_digest_items_endpoint_date
  ON public.webhook_digest_items(project_id, kind, endpoint_id, endpoint_url, digest_date)
  WHERE status IN ('pending', 'retrying', 'processing');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_webhook_digest_items_updated_at'
      AND tgrelid = 'public.webhook_digest_items'::regclass
  ) THEN
    CREATE TRIGGER trg_webhook_digest_items_updated_at
      BEFORE UPDATE ON public.webhook_digest_items
      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

ALTER TABLE public.webhook_digest_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_digest_items_select_owned" ON public.webhook_digest_items;
CREATE POLICY "webhook_digest_items_select_owned"
  ON public.webhook_digest_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = webhook_digest_items.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Service role manages webhook digest items" ON public.webhook_digest_items;
CREATE POLICY "Service role manages webhook digest items"
  ON public.webhook_digest_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
