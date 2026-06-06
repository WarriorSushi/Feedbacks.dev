# Step 4 Domain And Hardening Notes — 6th June 2026

## Current Step

Step 4 is now active: launch hardening and docs alignment.

Step 3 is intentionally deferred until real connector and Dodo credentials are available. The skipped work is recorded in `docs/2026-06-06-real-connector-and-billing-verification.md`.

## Canonical Origins

- `https://feedbacks.dev`: marketing and documentation.
- `https://app.feedbacks.dev`: hosted dashboard, API, widget assets, public boards, and board directory.
- Self-hosted deployments: replace the hosted app origin with the operator's own dashboard domain through `NEXT_PUBLIC_APP_ORIGIN`.

## Files Aligned In This Pass

- `README.md`: hosted public boards and REST API examples now use `https://app.feedbacks.dev`.
- `packages/dashboard/src/app/page.tsx`: landing REST API snippet now uses `publicEnv.NEXT_PUBLIC_APP_ORIGIN`.
- `docs/DEPLOYMENT.md`: self-hosted examples should use the deployment's app origin, not the hosted marketing domain.
- `DESIGN.md`: product UI guidance now exists outside the launch plan and Impeccable memory.
- `PRODUCT.md`: Impeccable-compatible product context now mirrors the existing `.impeccable.md` design context.

## Security Posture Review

### Rate Limiting

Current state:

- `sql/013_launch_security_hardening.sql` adds `public.check_rate_limit(...)`.
- The function takes an advisory transaction lock per `key:route`, cleans expired rows, counts the current window, and records the request in one server-side call.
- `packages/dashboard/src/lib/rate-limit.ts` calls that RPC first and falls back to the older database path if migration `013` has not been applied yet.

Decision:

- Use the atomic RPC after migration `013` is applied.
- Keep the fallback only to avoid breaking local or self-hosted environments that have not applied the newest migration yet.

### Stored Integration Secrets

Current state:

- Webhook URLs and GitHub tokens are normalized server-side.
- GitHub tokens must never be shown in page text, logs, screenshots, or docs.
- Delivery logs should keep response bodies short and must not include secrets.

Decision:

- Keep the current product behavior for this pass.
- Before production signoff, re-check every integration screen and delivery-log payload for secret leakage.
- Future hardening should consider encrypted-at-rest connector secrets if this becomes a hosted SaaS default.

### Outbound Webhook Signatures

Current state:

- Incoming Dodo webhooks have signature and timestamp verification.
- Outbound Slack, Discord, generic, and GitHub deliveries do not expose a first-party verification signature for recipients.

Decision:

- Do not add outbound signatures in this pass.
- Before launch, decide whether generic webhooks need an optional per-endpoint signing secret and headers such as `X-Feedbacks-Timestamp` and `X-Feedbacks-Signature`.

### Migrations

Current state:

- `docs/DEPLOYMENT.md` lists the ordered migration chain.
- Live Supabase read-only verification was performed on project `xiiaugllydxxmjbtzfux`.
- Live project is healthy on Postgres 17.
- Live migration ledger starts at Phase 6 branch-style migrations rather than the repo's full `001` through `013` ordered SQL chain.
- Live schema contains `public.widget_config_events`, which is not present in the canonical repo SQL chain.
- Deployment docs now include `002_public_board_voting.sql` and `003_agent_support.sql`; omitting them made the fresh ordered chain impossible because `004_fix_public_board.sql` depends on `public_board_settings` and `votes`.
- `004_fix_public_board.sql` now drops/recreates duplicate board/vote policies so it can safely run after `002_public_board_voting.sql`.
- `005_security_fixes.sql`, `006_public_board_comments.sql`, and `009_billing_and_entitlements.sql` now drop/recreate named policies or triggers where needed so the deployment guide's idempotency guidance is closer to reality.

Decision:

- Keep the ordered migration chain as the source of truth.
- Do not mutate live Supabase from this pass.
- Apply and verify `sql/013_launch_security_hardening.sql` in a controlled migration window.
- Reconcile live migration history and the extra `widget_config_events` table before launch.
- Re-run empty-database migration verification before launch.

## Live Supabase Advisor Snapshot

Read-only checks on 6th June 2026 found:

- Security advisor warnings for public execution of SECURITY DEFINER functions.
- Security advisor warning for `widget_config_events` having RLS enabled with no policies.
- Security advisor warnings for mutable function search paths on older board/vote trigger functions.
- Performance advisor warnings for unindexed Phase 6 foreign keys.
- Performance advisor warnings where RLS policies used direct `auth.uid()` instead of `(select auth.uid())`.
- Auth leaked password protection is disabled in Supabase Auth settings.

Actions in this pass:

- Added `sql/013_launch_security_hardening.sql`.
- Updated rate limiting to prefer the atomic RPC.
- Updated deployment docs with migration `013`.
- Verified `pnpm type-check`, `pnpm lint`, `pnpm test:unit`, and `pnpm test:e2e:required` pass after the repo changes.

Still manual:

- Enable leaked password protection in Supabase Auth settings.
- Decide whether to apply migration `013` directly to live Supabase or through a Supabase branch/staging window.
- Re-run Supabase security and performance advisors after `013` is applied.

## Next Step 4 Work

1. Finish any remaining domain references in active docs or generated examples.
2. Re-run type-check and lint after code/docs alignment.
3. Run browser acceptance again after any UI-facing changes.
4. Revisit Step 3 as soon as real connector and Dodo credentials are available.
