-- 027_operational_health_indexes.sql
-- Keep internal health probes bounded as delivery and activation history grows.

create index if not exists idx_webhook_deliveries_status_created
  on public.webhook_deliveries(status, created_at desc);

create index if not exists idx_activation_milestones_event_seen
  on public.activation_milestones(event_name, first_seen_at desc);

