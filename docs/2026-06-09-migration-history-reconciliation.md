# Migration History Reconciliation - 9 June 2026

## Summary

The repo now has one canonical internal fresh-database chain:

```text
sql/001_initial_schema.sql
...
sql/024_webhook_digest_items.sql
```

Internal staging, recovery, and disposable verification projects should run that ordered chain from `001` through `024`.

The live Supabase project is different because earlier work landed through branch-style or manual migrations. That live history is real and should be documented, not rewritten casually.

This is not customer setup documentation. feedbacks.dev customers should use the hosted service and should not need Supabase access, Docker, `psql`, or migration tooling.

## Live Project

Project:

```text
xiiaugllydxxmjbtzfux - feedbacks.dev
```

MCP migration history on 9 June 2026:

```text
20260326112053 phase6_typed_board_profile_columns
20260326112113 phase6_board_announcements
20260326112134 phase6_follows_watches_reports
20260326112148 phase6_webhook_jobs
20260405220327 009_billing_and_entitlements
20260405224008 010_api_key_hardening
20260405224016 011_notification_digests
20260605152552 project_stats_and_digest_rls
20260606074137 013_launch_security_hardening
20260606074308 014_fix_rate_limit_uuid_generation
20260606074420 015_server_managed_votes
```

Interpretation:

- Live Supabase already contains the older base schema even though `001` through `008` are not present as ledger entries.
- Live Supabase has applied the launch hardening and follow-up hardening migrations through `024`.
- Do not replay `001` through `012` on the live project.
- Do not use `supabase migration repair` on production unless a separate backup/staging rehearsal proves the exact ledger operation.

## Internal Fresh-Database Story

For a new internal staging, recovery, or clean Supabase project:

1. Ignore `sql/000_full_reset_v2-ran this one for v2. nothing else needed.sql`.
2. Run `sql/001` through `sql/024` in order.
3. Verify RLS is enabled on all public tables.
4. Verify `public.check_rate_limit(...)` exists.
5. Verify public board votes are read-only to direct clients and written through server routes.
6. Verify agent setup audit/token policies use `(select auth.uid())` owner checks.
7. Verify `usage_counters` keeps owner SELECT and explicit denied insert/update/delete policies.
8. Verify public board settings, announcements, and public feedback notes each have one consolidated SELECT policy plus explicit owner write policies where applicable.
9. Verify `cron_runs` records webhook and notification digest cron executions.
10. Verify `webhook_digest_items` batches digest endpoint deliveries into `feedback.digest` webhook logs.

## Fresh Empty-Database Test Status

Attempted on 9 June 2026.

Local blockers:

- Supabase CLI is installed: `2.105.0`.
- Docker is not installed in this environment.
- `psql` is not installed in this environment.
- `supabase db reset` and local Supabase start require Docker.

Remote branch blocker:

- Supabase MCP reported branch cost as `$0.01344/hour`.
- The connector cost confirmation succeeded.
- Branch creation failed because Supabase branching requires the Pro plan or above.

Result:

- A true disposable clean-database execution test could not be completed from this machine.
- The repo should still treat a clean `001` through `024` run as required before relying on a new staging/recovery database or before doing high-risk production schema work.
- This is not a blocker for customers using the hosted service.

## Remaining Action

Run the fresh migration test in one of these environments:

- a machine with Docker available, using Supabase CLI local database reset
- a Supabase organization with branching enabled
- a throwaway Supabase project created only for migration verification

When it passes, update this file with:

```text
Date:
Environment:
Command or tool:
Migration range:
Result:
Fixes made:
```
