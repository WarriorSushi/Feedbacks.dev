-- 014_fix_rate_limit_uuid_generation.sql
-- Fix check_rate_limit on Supabase projects where uuid_generate_v4() is not
-- visible from the function's locked search_path.

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
  values (gen_random_uuid(), p_key, p_route, now());

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(normalized_limit - current_count - 1, 0)
  );
end;
$$;

revoke execute on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;
