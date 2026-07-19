-- 032_plan_foreign_key_indexes.sql
-- Cover the foreign-key columns introduced by the Product Updates rollout so
-- parent updates and deletes do not scan the full referencing tables.

create index if not exists idx_product_update_metrics_project_update
  on public.product_update_metrics(project_id, update_id);

create index if not exists idx_product_updates_created_by
  on public.product_updates(created_by)
  where created_by is not null;

create index if not exists idx_webhook_digest_items_last_delivery
  on public.webhook_digest_items(last_delivery_id)
  where last_delivery_id is not null;
