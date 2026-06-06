-- 013_launch_security_hardening.sql
-- Advisor-driven launch hardening for rate limits, function exposure, and Phase 6 indexes.

-- ---------------------------------------------------------------------------
-- 1. Atomic server-side rate limit helper
-- ---------------------------------------------------------------------------

create or replace function public.check_rate_limit(
  p_key text,
  p_route text,
  p_limit integer default 10,
  p_window_seconds integer default 60
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  normalized_limit integer;
  normalized_window_seconds integer;
begin
  if p_key is null or length(trim(p_key)) = 0 or p_route is null or length(trim(p_route)) = 0 then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  end if;

  normalized_limit := greatest(1, least(coalesce(p_limit, 10), 10000));
  normalized_window_seconds := greatest(1, least(coalesce(p_window_seconds, 60), 86400));

  perform pg_advisory_xact_lock(hashtextextended(p_key || ':' || p_route, 0));

  delete from public.rate_limits
  where key = p_key
    and route = p_route
    and created_at < now() - make_interval(secs => normalized_window_seconds);

  select count(*)::integer
  into current_count
  from public.rate_limits
  where key = p_key
    and route = p_route
    and created_at >= now() - make_interval(secs => normalized_window_seconds);

  if current_count >= normalized_limit then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  end if;

  insert into public.rate_limits (id, key, route, created_at)
  values (uuid_generate_v4(), p_key, p_route, now());

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(normalized_limit - current_count - 1, 0)
  );
end;
$$;

revoke execute on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 2. Restrict SECURITY DEFINER functions to server-side use
-- ---------------------------------------------------------------------------

revoke execute on function public.avg_rating_for_project(uuid) from public, anon, authenticated;
revoke execute on function public.count_by_column(text, text, uuid) from public, anon, authenticated;
revoke execute on function public.generate_api_key() from public, anon, authenticated;
revoke execute on function public.increment_usage_counter(uuid, text, date, integer) from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.widget_configs_before_write() from public, anon, authenticated;

grant execute on function public.avg_rating_for_project(uuid) to service_role;
grant execute on function public.count_by_column(text, text, uuid) to service_role;
grant execute on function public.generate_api_key() to service_role;
grant execute on function public.increment_usage_counter(uuid, text, date, integer) to service_role;

alter function public.update_board_settings_updated_at() set search_path = public;
alter function public.update_feedback_vote_count() set search_path = public;

-- ---------------------------------------------------------------------------
-- 3. Index foreign keys surfaced by Supabase performance advisors
-- ---------------------------------------------------------------------------

create index if not exists idx_board_announcements_project_id
  on public.board_announcements(project_id);

create index if not exists idx_board_announcements_created_by
  on public.board_announcements(created_by)
  where created_by is not null;

create index if not exists idx_board_follows_project_id
  on public.board_follows(project_id);

create index if not exists idx_feedback_watches_project_id
  on public.feedback_watches(project_id);

create index if not exists idx_board_reports_feedback_id
  on public.board_reports(feedback_id)
  where feedback_id is not null;

create index if not exists idx_board_reports_user_id
  on public.board_reports(user_id)
  where user_id is not null;

create index if not exists idx_webhook_jobs_last_delivery_id
  on public.webhook_jobs(last_delivery_id)
  where last_delivery_id is not null;

-- ---------------------------------------------------------------------------
-- 4. RLS policy cleanup for auth.uid() initplan warnings
-- ---------------------------------------------------------------------------

drop policy if exists "Project owners can manage board settings" on public.public_board_settings;
create policy "Project owners can manage board settings" on public.public_board_settings
  for all
  using (
    project_id in (
      select id from public.projects where owner_user_id = (select auth.uid())
    )
  )
  with check (
    project_id in (
      select id from public.projects where owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "board_announcements_owner_all" on public.board_announcements;
create policy "board_announcements_owner_all" on public.board_announcements
  for all
  using (
    exists (
      select 1
      from public.projects as p
      where p.id = board_announcements.project_id
        and p.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.projects as p
      where p.id = board_announcements.project_id
        and p.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "board_follows_select_own" on public.board_follows;
create policy "board_follows_select_own" on public.board_follows
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "board_follows_insert_own" on public.board_follows;
create policy "board_follows_insert_own" on public.board_follows
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "board_follows_delete_own" on public.board_follows;
create policy "board_follows_delete_own" on public.board_follows
  for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "feedback_watches_select_own" on public.feedback_watches;
create policy "feedback_watches_select_own" on public.feedback_watches
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "feedback_watches_insert_own" on public.feedback_watches;
create policy "feedback_watches_insert_own" on public.feedback_watches
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "feedback_watches_delete_own" on public.feedback_watches;
create policy "feedback_watches_delete_own" on public.feedback_watches
  for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "board_reports_select_owned" on public.board_reports;
create policy "board_reports_select_owned" on public.board_reports
  for select
  using (
    exists (
      select 1
      from public.projects as p
      where p.id = board_reports.project_id
        and p.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "board_reports_update_owned" on public.board_reports;
create policy "board_reports_update_owned" on public.board_reports
  for update
  using (
    exists (
      select 1
      from public.projects as p
      where p.id = board_reports.project_id
        and p.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.projects as p
      where p.id = board_reports.project_id
        and p.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "webhook_jobs_select_owned" on public.webhook_jobs;
create policy "webhook_jobs_select_owned" on public.webhook_jobs
  for select
  using (
    exists (
      select 1
      from public.projects as p
      where p.id = webhook_jobs.project_id
        and p.owner_user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Live-drift compatibility: deny access to widget_config_events if present
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.widget_config_events') is not null then
    execute 'alter table public.widget_config_events enable row level security';
    execute 'drop policy if exists "widget_config_events_deny_all" on public.widget_config_events';
    execute 'create policy "widget_config_events_deny_all" on public.widget_config_events for all using (false) with check (false)';
  end if;
end $$;
