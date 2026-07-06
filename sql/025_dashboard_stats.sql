-- 025_dashboard_stats.sql
-- Return dashboard summaries without sending every historical rating, type,
-- and timestamp to the Next.js server.

create or replace function public.dashboard_stats(
  p_user_id uuid,
  p_project_id uuid default null,
  p_history_cutoff timestamptz default null,
  p_trend_start timestamptz default (now() - interval '6 days')
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select f.rating, f.type, f.agent_name, f.read_at, f.created_at
    from public.feedback f
    inner join public.projects p on p.id = f.project_id
    where p.owner_user_id = p_user_id
      and f.is_archived = false
      and (p_project_id is null or f.project_id = p_project_id)
      and (p_history_cutoff is null or f.created_at >= p_history_cutoff)
  ),
  summary as (
    select
      count(*)::integer as total,
      count(*) filter (where read_at is null)::integer as unread,
      round(avg(rating)::numeric, 2) filter (where rating is not null) as average_rating,
      count(rating)::integer as rating_count,
      count(*) filter (where agent_name is not null)::integer as agent_count
    from scoped
  ),
  type_counts as (
    select coalesce(jsonb_object_agg(type, item_count), '{}'::jsonb) as value
    from (
      select coalesce(type, 'other') as type, count(*)::integer as item_count
      from scoped
      group by coalesce(type, 'other')
    ) counts
  ),
  daily_counts as (
    select coalesce(jsonb_object_agg(day, item_count), '{}'::jsonb) as value
    from (
      select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day,
             count(*)::integer as item_count
      from scoped
      where created_at >= p_trend_start
      group by to_char(created_at at time zone 'UTC', 'YYYY-MM-DD')
    ) counts
  )
  select jsonb_build_object(
    'total', summary.total,
    'unread', summary.unread,
    'average_rating', summary.average_rating,
    'rating_count', summary.rating_count,
    'agent_count', summary.agent_count,
    'type_counts', type_counts.value,
    'daily_counts', daily_counts.value
  )
  from summary, type_counts, daily_counts;
$$;

revoke execute on function public.dashboard_stats(uuid, uuid, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.dashboard_stats(uuid, uuid, timestamptz, timestamptz)
  to service_role;

