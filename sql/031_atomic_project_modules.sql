-- 031_atomic_project_modules.sql
-- Save Feedback and Updates activation together so the dashboard never leaves
-- a project in a partially updated module state.

create or replace function public.set_project_modules(
  p_project_id uuid,
  p_feedback boolean,
  p_updates boolean
) returns table (feedback boolean, updates boolean)
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  update public.projects
  set settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{widget_config}',
    coalesce(settings -> 'widget_config', '{}'::jsonb)
      || jsonb_build_object('feedbackEnabled', p_feedback),
    true
  )
  where id = p_project_id;

  if not found then
    raise exception 'project not found';
  end if;

  insert into public.product_update_settings (project_id, enabled)
  values (p_project_id, p_updates)
  on conflict (project_id) do update
    set enabled = excluded.enabled;

  return query select p_feedback, p_updates;
end;
$$;

revoke all on function public.set_project_modules(uuid, boolean, boolean)
  from public, anon, authenticated;
grant execute on function public.set_project_modules(uuid, boolean, boolean)
  to service_role;
