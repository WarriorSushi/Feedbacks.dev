-- 012_project_stats_and_digest_rls.sql
-- Fill stats RPC gaps and add RLS coverage for notification digest tracking.

create or replace function public.avg_rating_for_project(p_project_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select round(avg(rating)::numeric, 2)
  from public.feedback
  where project_id = p_project_id
    and rating is not null;
$$;

drop function if exists public.count_by_column(text, text, uuid);

create or replace function public.count_by_column(
  table_name text,
  column_name text,
  filter_project_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if table_name <> 'feedback' then
    raise exception 'Unsupported table for count_by_column: %', table_name;
  end if;

  if column_name not in ('type', 'status', 'priority') then
    raise exception 'Unsupported column for count_by_column: %', column_name;
  end if;

  execute format(
    'select coalesce(jsonb_agg(jsonb_build_object(%L, value, ''count'', row_count) order by row_count desc), ''[]''::jsonb)
     from (
       select %I::text as value, count(*)::integer as row_count
       from public.feedback
       where project_id = $1 and %I is not null
       group by %I
     ) counts',
    column_name,
    column_name,
    column_name,
    column_name
  )
  using filter_project_id
  into result;

  return coalesce(result, '[]'::jsonb);
end;
$$;

alter table public.notification_digests enable row level security;

drop policy if exists "notification_digests_select_own" on public.notification_digests;
create policy "notification_digests_select_own" on public.notification_digests
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "notification_digests_no_client_inserts" on public.notification_digests;
create policy "notification_digests_no_client_inserts" on public.notification_digests
  for insert
  with check (false);

drop policy if exists "notification_digests_no_client_updates" on public.notification_digests;
create policy "notification_digests_no_client_updates" on public.notification_digests
  for update
  using (false)
  with check (false);

drop policy if exists "notification_digests_no_client_deletes" on public.notification_digests;
create policy "notification_digests_no_client_deletes" on public.notification_digests
  for delete
  using (false);
