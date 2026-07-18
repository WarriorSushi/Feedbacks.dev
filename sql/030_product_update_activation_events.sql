-- Phase 7: aggregate owner activation milestones for Product Updates.
-- These are one-time project milestones; no visitor identity, URL, or page-view
-- data is stored.
alter table public.activation_milestones
  drop constraint if exists activation_milestones_event_name_check;

alter table public.activation_milestones
  add constraint activation_milestones_event_name_check check (event_name in (
    'project_created', 'install_code_copied', 'verification_completed',
    'first_feedback_received', 'first_feedback_triaged', 'integration_connected',
    'updates_nav_opened', 'updates_setup_started', 'updates_install_method_selected',
    'updates_embed_verified', 'updates_activated', 'updates_first_draft_created',
    'updates_private_test_opened', 'updates_first_published',
    'updates_first_impression_received'
  ));
