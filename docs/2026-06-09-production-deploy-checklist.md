# Production Deploy Checklist - 9 June 2026

Use this as the launch signoff checklist before connecting Dodo Payments to production traffic.

Status refresh on 14 June 2026:

- The product is hosted-first. Customers should use `feedbacks.dev` / `app.feedbacks.dev`; they do not need to run Supabase migrations.
- The SQL chain is an internal staging, recovery, and verification path.
- Items that require Vercel, DNS, GitHub OAuth, or Supabase dashboard settings stay unchecked until verified in those consoles.

## Domains

- [x] `https://feedbacks.dev` redirects to the live marketing/docs site at `https://www.feedbacks.dev`.
- [ ] `https://app.feedbacks.dev` serves dashboard, API, widget assets, and public boards.
- [ ] `NEXT_PUBLIC_APP_ORIGIN=https://app.feedbacks.dev` in production.
- [x] Public docs are hosted-first and do not tell customers to run infrastructure.

14 June 2026 probe:

- `https://feedbacks.dev` returns a Vercel 307 redirect to `https://www.feedbacks.dev/`.
- `https://www.feedbacks.dev` returns HTTP 200.
- `app.feedbacks.dev` resolves to Vercel DNS, but HTTPS currently fails with an expired certificate. Fix the domain/certificate state in Vercel before launch signoff.

## Supabase Auth

- [ ] Site URL is set to the production app origin.
- [ ] Redirect URLs include:
  - [ ] `https://app.feedbacks.dev/auth/callback`
  - [ ] local dev callback URL
- [ ] GitHub OAuth callback points at the Supabase Auth callback URL.
- [ ] Email provider is production-ready.
- [ ] Leaked password protection is enabled in Supabase Auth password security settings.

14 June 2026 note: MCP confirms the live Supabase project `xiiaugllydxxmjbtzfux` is `ACTIVE_HEALTHY` in `eu-west-2` on Postgres 17. The available MCP tools can read advisors and project health, but not the Auth URL configuration.

## Supabase Database

- [ ] Internal staging/recovery projects use the canonical `sql/001` through `sql/015` chain.
- [ ] Live project migration history is explained by `docs/2026-06-09-migration-history-reconciliation.md`.
- [ ] `public.check_rate_limit(...)` exists and blocks repeated requests.
- [ ] Public board vote writes go through server routes, not direct client RLS writes.
- [x] All live public tables have RLS enabled.
- [x] Server-only SECURITY DEFINER functions are executable by `postgres` and `service_role`, not direct clients.
- [ ] Security advisor has no unresolved app-side issues. 14 June 2026 refresh still shows leaked password protection disabled.
- [ ] Performance advisor findings are reviewed after real traffic. 14 June 2026 refresh shows unused indexes and multiple permissive policy warnings.

## Supabase Storage

- [x] `feedback_screenshots` bucket exists.
- [x] `feedback_attachments` bucket exists.
- [ ] Bucket access matches the screenshot and attachment model.
- [x] Screenshot uploads are image-only and capped at 3 MB in live storage.
- [x] Attachment uploads are MIME-limited in live storage and capped at 5 MB by the API.

## Vercel

- [ ] Production project root directory is `packages/dashboard`.
- [ ] Build command is `cd ../.. && pnpm build`.
- [ ] Install command is `cd ../.. && pnpm install`.
- [ ] Node.js version is 20 or newer.
- [ ] Include source files outside root directory is enabled for the monorepo.
- [ ] Required env vars exist:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_ORIGIN`
  - [ ] `CRON_SECRET`
  - [ ] `WEBHOOK_JOB_SECRET`
  - [ ] `VOTE_HMAC_SECRET`
  - [ ] `BOARD_REPORT_SALT`
  - [ ] billing env vars when Dodo is enabled
  - [ ] captcha env vars if captcha is enabled

14 June 2026 note: local Vercel CLI is installed, but the workspace is not linked to the Vercel project. `vercel env ls production` could not verify env vars without linking the project, and `vercel domains inspect app.feedbacks.dev` failed for the current account.

## Cron Jobs

- [ ] Webhook jobs cron runs every 5 minutes.
- [ ] Notification digest cron runs daily.
- [ ] `CRON_SECRET` exists in Vercel production env so Vercel sends `Authorization: Bearer <CRON_SECRET>` to cron routes.
- [ ] Manual internal webhook job processing route is not publicly usable without its secret.

## Widget Assets

- [ ] `packages/dashboard/public/widget/latest.js` exists after build or copy.
- [ ] `packages/dashboard/public/widget/v2.js` exists after build or copy.
- [ ] Hosted snippet points to `https://app.feedbacks.dev/widget/latest.js`.
- [x] Public customer snippet points to the hosted app origin.
- [ ] `https://app.feedbacks.dev/widget/latest.js` is reachable over valid HTTPS.
- [ ] Widget size check passes when widget files change.

## Integrations

- [ ] Slack real test send and replay are verified.
- [ ] Discord real test send and replay are verified.
- [ ] Generic webhook real test send and replay are verified.
- [x] Generic webhook signing headers are documented and verified.
- [ ] GitHub Issues real test send and replay are verified.
- [x] Secret URLs and tokens are never shown in full in UI, logs, screenshots, or docs.

14 June 2026 direct external connector smoke pass:

- Slack dummy feedback event delivered with HTTP `200`; user manually confirmed receipt.
- Discord dummy feedback event delivered with HTTP `204`; user manually confirmed receipt.
- Generic webhook dummy event delivered with HTTP `200`; HMAC verified against the exact raw request body.
- GitHub Issues dummy event created issue `#1` in the configured test repository with HTTP `201`; user manually confirmed it.
- This pass used local test credentials only. Dashboard delivery-history and replay verification are still pending, so the send-and-replay checklist items remain open.

## MCP And API

- [ ] `pnpm --filter @feedbacks/mcp-server build` passes.
- [ ] Claude Code config is tested.
- [ ] Cursor config is tested.
- [ ] Generic MCP stdio config is tested.
- [ ] Free plan blocks MCP/API where expected.
- [ ] Pro plan allows MCP/API where expected.

## Dodo Payments

- [ ] Dodo test checkout returns to `/billing`.
- [ ] Plan changes only after verified webhook state updates.
- [ ] Valid current Dodo webhook passes verification.
- [ ] Invalid signature is rejected.
- [ ] Stale timestamp is rejected.
- [ ] Too-far-future timestamp is rejected.
- [ ] Real Dodo signature format is confirmed against the implementation.

## Browser Acceptance

- [ ] Install flow passes.
- [ ] Hosted widget verify flow passes.
- [ ] Webhook configuration, test send, and replay pass.
- [ ] Board submit duplicate/spam checks pass.
- [ ] Board moderation reply/status/hide flow passes.
- [ ] Board directory category filtering passes.
- [ ] Empty, loading, and error states are checked on desktop and mobile widths.
