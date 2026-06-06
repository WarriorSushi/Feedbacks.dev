# Live Supabase Schema Audit — 6th June 2026

## Scope

Read-only Supabase MCP checks against project `xiiaugllydxxmjbtzfux` (`feedbacks.dev`).

No live migrations were applied in this pass.

## Project

- Status: active and healthy
- Region: `eu-west-2`
- Postgres: 17.6.1

## Migration History

Live migration history currently contains:

- `20260326112053 phase6_typed_board_profile_columns`
- `20260326112113 phase6_board_announcements`
- `20260326112134 phase6_follows_watches_reports`
- `20260326112148 phase6_webhook_jobs`
- `20260405220327 009_billing_and_entitlements`
- `20260405224008 010_api_key_hardening`
- `20260405224016 011_notification_digests`
- `20260605152552 project_stats_and_digest_rls`

Repo deployment docs now use the ordered `sql/001` through `sql/013` chain as the canonical source of truth.

Correction made during this pass:

- `docs/DEPLOYMENT.md` now includes `002_public_board_voting.sql` and `003_agent_support.sql`.
- `004_fix_public_board.sql` now drops/recreates duplicate board/vote policies so it can run after `002_public_board_voting.sql`.
- `005_security_fixes.sql`, `006_public_board_comments.sql`, and `009_billing_and_entitlements.sql` now drop/recreate named policies or triggers before creating them.

Risk:

- The live migration ledger does not show the base `001` through `008` files as applied migrations, likely because the live project was built from earlier manual or branch-style SQL.
- Before launch, reconcile live migration history with the repo's ordered SQL chain so a fresh project and live project are explainable from the same source.

## RLS Inventory

All public tables reported RLS enabled.

One live-only drift table needs attention:

- `public.widget_config_events`: RLS enabled, zero policies, and not present in the repo's canonical SQL files.

Action added:

- `sql/013_launch_security_hardening.sql` adds a compatibility deny-all policy if `widget_config_events` exists.

## Advisor Findings

Security advisor findings:

- Several SECURITY DEFINER functions were executable by `anon` and `authenticated`.
- `update_board_settings_updated_at` and `update_feedback_vote_count` had mutable search paths.
- `votes` has intentionally permissive anonymous insert/delete policies for public voting.
- Supabase Auth leaked password protection is disabled.

Performance advisor findings:

- Several Phase 6 foreign keys lacked covering indexes.
- Several RLS policies used direct `auth.uid()` instead of `(select auth.uid())`.
- Some indexes are unused, likely because the project has low production traffic or the surfaces are new.

## Action Taken In Repo

Added `sql/013_launch_security_hardening.sql` to:

- add atomic `public.check_rate_limit(...)`
- revoke direct client execution from server-only SECURITY DEFINER functions
- add Phase 6 foreign-key indexes surfaced by advisors
- set search paths on older trigger functions
- replace direct `auth.uid()` in advisor-flagged policies
- add a live-drift deny-all policy for `widget_config_events` if the table exists

Updated `packages/dashboard/src/lib/rate-limit.ts` to prefer the new RPC and fall back to the old path only when migration `013` is missing.

## Verification

After the repo changes:

- `pnpm type-check` passed
- `pnpm lint` passed
- `pnpm test:unit` passed
- `pnpm test:e2e:required` passed, 10/10 browser tests

## Still To Do

1. Apply `sql/013_launch_security_hardening.sql` to staging or a Supabase branch first.
2. Re-run Supabase security and performance advisors.
3. Decide whether the intentionally public `votes` policies should remain as-is or move fully behind server-only policies.
4. Enable leaked password protection in Supabase Auth settings.
5. Reconcile the live migration ledger with the repo's canonical SQL chain.
