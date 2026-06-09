# Migration History Reconciliation - 9 June 2026

## Summary

The repo now has one canonical fresh-install chain:

```text
sql/001_initial_schema.sql
...
sql/015_server_managed_votes.sql
```

Fresh projects should run that ordered chain from `001` through `015`.

The live Supabase project is different because earlier work landed through branch-style or manual migrations. That live history is real and should be documented, not rewritten casually.

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
- Live Supabase has applied the launch hardening migrations `013`, `014`, and `015`.
- Do not replay `001` through `012` on the live project.
- Do not use `supabase migration repair` on production unless a separate backup/staging rehearsal proves the exact ledger operation.

## Fresh Project Story

For a new self-hosted or clean Supabase project:

1. Ignore `sql/000_full_reset_v2-ran this one for v2. nothing else needed.sql`.
2. Run `sql/001` through `sql/015` in order.
3. Verify RLS is enabled on all public tables.
4. Verify `public.check_rate_limit(...)` exists.
5. Verify public board votes are read-only to direct clients and written through server routes.

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
- The repo should still treat a clean `001` through `015` run as required before Dodo Payments production work.

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
