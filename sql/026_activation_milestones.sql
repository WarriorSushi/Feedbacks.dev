-- 026_activation_milestones.sql
-- Privacy-preserving first-party funnel milestones. One row per project/event;
-- no page-view stream, visitor fingerprint, message text, email, or widget data.

create table if not exists public.activation_milestones (
  project_id uuid not null references public.projects(id) on delete cascade,
  event_name text not null check (event_name in (
    'project_created',
    'install_code_copied',
    'verification_completed',
    'first_feedback_received',
    'first_feedback_triaged',
    'integration_connected'
  )),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_seen_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (project_id, event_name)
);

create index if not exists idx_activation_milestones_user_seen
  on public.activation_milestones(user_id, first_seen_at desc);

alter table public.activation_milestones enable row level security;
revoke all on table public.activation_milestones from public, anon, authenticated;
grant select, insert, update on table public.activation_milestones to service_role;

