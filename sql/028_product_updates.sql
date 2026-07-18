-- 028_product_updates.sql
-- Project-scoped, privacy-preserving in-app Product Updates / What's New.

create table if not exists public.product_update_settings (
  project_id uuid primary key references public.projects(id) on delete cascade,
  enabled boolean not null default false,
  auto_show boolean not null default true,
  display_delay_ms integer not null default 1500 check (display_delay_ms between 0 and 30000),
  theme text not null default 'auto' check (theme in ('auto', 'light', 'dark')),
  accent_color text,
  include_paths text[] not null default '{}',
  exclude_paths text[] not null default '{}',
  show_powered_by boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$'),
  check (cardinality(include_paths) <= 10),
  check (cardinality(exclude_paths) <= 10)
);

create table if not exists public.product_updates (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version_label text,
  title text not null,
  summary text not null,
  highlights text[] not null default '{}',
  image_path text,
  cta_label text,
  cta_url text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(title)) between 1 and 120),
  check (length(trim(summary)) between 1 and 280),
  check (version_label is null or length(trim(version_label)) between 1 and 32),
  check (cardinality(highlights) <= 8),
  check (cta_label is null or length(trim(cta_label)) between 1 and 40),
  check (cta_url is null or length(trim(cta_url)) between 1 and 2048),
  check ((cta_label is null) = (cta_url is null)),
  check (status <> 'published' or published_at is not null),
  check (expires_at is null or published_at is null or expires_at > published_at),
  unique (project_id, id)
);

create index if not exists idx_product_updates_project_created on public.product_updates(project_id, created_at desc);
create index if not exists idx_product_updates_publication on public.product_updates(project_id, status, published_at desc) where status = 'published';

create table if not exists public.product_update_metrics (
  project_id uuid not null references public.projects(id) on delete cascade,
  update_id uuid not null,
  metric_date date not null default current_date,
  event_type text not null check (event_type in ('impression', 'dismissal', 'cta_click')),
  count bigint not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (update_id, metric_date, event_type),
  foreign key (project_id, update_id) references public.product_updates(project_id, id) on delete cascade
);

create index if not exists idx_product_update_metrics_project_date on public.product_update_metrics(project_id, metric_date desc);

alter table public.product_update_settings enable row level security;
alter table public.product_updates enable row level security;
alter table public.product_update_metrics enable row level security;

revoke all on table public.product_update_settings, public.product_updates, public.product_update_metrics from public, anon;
grant select, insert, update, delete on table public.product_update_settings, public.product_updates to authenticated;
grant select on table public.product_update_metrics to authenticated;
grant select, insert, update, delete on table public.product_update_settings, public.product_updates, public.product_update_metrics to service_role;

create policy "product_update_settings_select_own" on public.product_update_settings for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_update_settings_insert_own" on public.product_update_settings for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_update_settings_update_own" on public.product_update_settings for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_update_settings_delete_own" on public.product_update_settings for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));

create policy "product_updates_select_own" on public.product_updates for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_updates_insert_own" on public.product_updates for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_updates_update_own" on public.product_updates for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_updates_delete_own" on public.product_updates for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));
create policy "product_update_metrics_select_own" on public.product_update_metrics for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));

drop trigger if exists trg_product_update_settings_updated_at on public.product_update_settings;
create trigger trg_product_update_settings_updated_at before update on public.product_update_settings for each row execute function public.touch_updated_at();
drop trigger if exists trg_product_updates_updated_at on public.product_updates;
create trigger trg_product_updates_updated_at before update on public.product_updates for each row execute function public.touch_updated_at();
drop trigger if exists trg_product_update_metrics_updated_at on public.product_update_metrics;
create trigger trg_product_update_metrics_updated_at before update on public.product_update_metrics for each row execute function public.touch_updated_at();

create or replace function public.increment_product_update_metric(
  p_project_id uuid, p_update_id uuid, p_event_type text, p_metric_date date default current_date
) returns bigint language plpgsql security invoker set search_path = pg_catalog as $$
declare next_count bigint;
begin
  if p_event_type not in ('impression', 'dismissal', 'cta_click') then raise exception 'invalid product update metric'; end if;
  if not exists (select 1 from public.product_updates u where u.id = p_update_id and u.project_id = p_project_id) then
    raise exception 'product update does not belong to project';
  end if;
  insert into public.product_update_metrics(project_id, update_id, metric_date, event_type, count)
  values (p_project_id, p_update_id, p_metric_date, p_event_type, 1)
  on conflict (update_id, metric_date, event_type) do update
    set count = public.product_update_metrics.count + 1, updated_at = now()
  returning count into next_count;
  return next_count;
end;
$$;

create or replace function public.publish_product_update(
  p_project_id uuid, p_update_id uuid, p_published_at timestamptz, p_expires_at timestamptz,
  p_active_limit integer, p_allow_scheduling boolean
) returns public.product_updates language plpgsql security invoker set search_path = pg_catalog as $$
declare target public.product_updates; publication_time timestamptz; live_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_project_id::text, 0));
  select * into target from public.product_updates where id = p_update_id and project_id = p_project_id for update;
  if not found then raise exception 'product update not found'; end if;
  publication_time := coalesce(p_published_at, now());
  if publication_time > now() and not p_allow_scheduling then raise exception 'product update scheduling is not available'; end if;
  if p_expires_at is not null and p_expires_at <= publication_time then raise exception 'expiry must be later than publication'; end if;
  if publication_time <= now() and p_active_limit is not null and target.status <> 'published' then
    select count(*) into live_count from public.product_updates u
      where u.project_id = p_project_id and u.id <> p_update_id and u.status = 'published'
      and u.published_at <= now() and (u.expires_at is null or u.expires_at > now());
    if live_count >= p_active_limit then raise exception 'product update live limit reached'; end if;
  end if;
  update public.product_updates set status = 'published', published_at = publication_time, expires_at = p_expires_at, updated_at = now()
    where id = p_update_id and project_id = p_project_id returning * into target;
  return target;
end;
$$;

revoke all on function public.increment_product_update_metric(uuid, uuid, text, date) from public, anon, authenticated;
revoke all on function public.publish_product_update(uuid, uuid, timestamptz, timestamptz, integer, boolean) from public, anon, authenticated;
grant execute on function public.increment_product_update_metric(uuid, uuid, text, date) to service_role;
grant execute on function public.publish_product_update(uuid, uuid, timestamptz, timestamptz, integer, boolean) to service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('product_update_images', 'product_update_images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
