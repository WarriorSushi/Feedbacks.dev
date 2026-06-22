# Operations Hardening Checklist

Last updated: 2026-06-23

Use this before staging or production signoff. It complements `pnpm supabase:check`, which verifies required tables, columns, and storage buckets through the Supabase Data API.

## Supabase Schema Checks

Run:

```bash
pnpm supabase:check
pnpm supabase:types
```

Then verify index and policy health through Supabase:

```bash
supabase db advisors --type security
supabase db advisors --type performance
```

If the CLI is not authenticated, use the Supabase MCP advisors for the live project.

Latest live advisor and traffic snapshot from 2026-06-23:

- Performance: the agent setup `auth_rls_initplan` warning was cleared by `sql/020_optimize_agent_setup_rls.sql` and verified on the live project.
- Performance: the `usage_counters` multiple-permissive SELECT warning was cleared by `sql/021_split_usage_counter_write_rls.sql` and verified on the live project.
- Performance: public board/read multiple-permissive SELECT warnings were cleared by `sql/022_consolidate_public_board_read_rls.sql` and verified on the live project.
- Performance: unused-index review completed against live `pg_stat_user_indexes` and `pg_stat_user_tables` after production smoke traffic. Zero-scan indexes remain tiny, mostly 8-40 kB, and the relevant tables are still low volume. Keep them through launch and revisit after sustained production traffic instead of removing launch-support indexes early.

Required areas:

- `feedback.read_at`
- public board settings, follows, watches, reports, and announcements
- billing accounts, billing events, usage counters, and entitlement helpers
- notification digests
- cron run audit rows
- webhook digest item queue
- webhook jobs and deliveries
- `feedback_screenshots` and `feedback_attachments` buckets

## Cron And Queue Checks

Confirm Vercel cron schedules are present and monitored:

- `/api/cron/webhook-jobs`
- `/api/cron/notification-digests`

Check for:

- recent `cron_runs` rows for both jobs after production deploy
- webhook jobs stuck in `pending`, `processing`, or `retrying`
- notification digest rows missing for opted-in users
- billing webhook rejects or stale billing state
- repeated rate-limit spikes on public submission routes

## Production Smoke Tests

Run these after deploy:

1. Widget submission creates feedback with URL and browser context.
2. Hosted verification page creates a project-scoped inbox item.
3. Public board submission appears on the board and in the owner inbox.
4. Board watch/follow receives email fanout for status changes and team replies when email env is enabled.
5. Slack, Discord, GitHub Issues, and generic webhook test deliveries write delivery logs.
6. Generic webhook replay works and preserves payload `version`.
7. Billing webhook updates entitlement state from a verified Dodo event.
8. REST API and MCP list, submit, search, and update project-scoped feedback with a trusted API key.

Latest smoke result from 2026-06-23:

- Passed with disposable login `test@test.com` against `https://app.feedbacks.dev`.
- Verified hosted project creation, hosted verify, widget submission, inbox/mobile density, public board submit/duplicate/report/moderation/follow/watch, Slack/Discord/GitHub/generic webhook test sends and replays, generic daily digest delivery, REST API list/update, cron audit rows, GitHub Actions scheduler dispatch, and final production runtime logs.
- Fixed and redeployed two issues found by smoke: mobile directory card overflow and auth-page legal-link cross-origin prefetch console noise.

## Storage Retention

Screenshots and attachments currently use public Supabase Storage URLs for operational simplicity.
The retention decision for the current launch surface is owner-scoped retention: media is retained
with the feedback record and removed when the owning project or account is deleted. There is no
automatic time-based purge for launch.

Before larger production rollout:

- keep retention expectations aligned in customer-facing privacy copy
- add per-item media deletion only if individual feedback deletion becomes part of the shipped surface
- verify bucket MIME and size limits match `docs/DEPLOYMENT.md`
- keep a production smoke test for project/account deletion media cleanup before launch
