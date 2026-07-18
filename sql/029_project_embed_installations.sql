-- Phase 2: privacy-safe aggregate embed installation heartbeat.
create table if not exists public.project_embed_installations (
  project_id uuid primary key references public.projects(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  runtime_version text,
  feedback_enabled boolean not null default true,
  updates_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (runtime_version is null or length(runtime_version) <= 64)
);

alter table public.project_embed_installations enable row level security;
revoke all on table public.project_embed_installations from public, anon, authenticated;
grant select, insert, update, delete on table public.project_embed_installations to service_role;

create policy "project_embed_installations_select_own" on public.project_embed_installations for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_user_id = (select auth.uid())));

drop trigger if exists trg_project_embed_installations_updated_at on public.project_embed_installations;
create trigger trg_project_embed_installations_updated_at before update on public.project_embed_installations
  for each row execute function public.touch_updated_at();
