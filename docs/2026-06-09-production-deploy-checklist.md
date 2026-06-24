# Production Deploy Checklist - 9 June 2026

Use this as the launch signoff checklist before connecting Dodo Payments to production traffic.

Status refresh on 23 June 2026:

- The product is hosted-first. Customers should use `feedbacks.dev` / `app.feedbacks.dev`; they do not need to run Supabase migrations.
- The SQL chain is an internal staging, recovery, and verification path.
- Items that require Vercel, DNS, GitHub OAuth, or Supabase dashboard settings stay unchecked until verified in those consoles.
- Vercel production runtime deployment `dpl_H5xCf7tkuX7kWCHhedcYGZvrZh3x` was verified on `https://app.feedbacks.dev`.

## Domains

- [x] `https://feedbacks.dev` redirects to the live marketing/docs site at `https://www.feedbacks.dev`.
- [x] `https://app.feedbacks.dev` serves dashboard, API, widget assets, and public boards.
- [x] `NEXT_PUBLIC_APP_ORIGIN=https://app.feedbacks.dev` in production.
- [x] Public docs are hosted-first and do not tell customers to run infrastructure.

14 June 2026 probe, now superseded:

- `https://feedbacks.dev` returns a Vercel 307 redirect to `https://www.feedbacks.dev/`.
- `https://www.feedbacks.dev` returns HTTP 200.
- `app.feedbacks.dev` previously resolved to Vercel DNS but had an expired certificate. This was fixed on 15 June 2026.

15 June 2026 probe:

- `https://app.feedbacks.dev` returns HTTP 200 over valid HTTPS.
- `https://app.feedbacks.dev/widget/latest.js` returns HTTP 200 over valid HTTPS.
- `https://app.feedbacks.dev/widget/v2.js` returns HTTP 200 over valid HTTPS.
- `https://feedbacks.dev` still redirects to `https://www.feedbacks.dev/`.

## Supabase Auth

- [x] Site URL is set to the production app origin.
- [x] Redirect URLs include:
  - [x] `https://app.feedbacks.dev/auth/callback`
  - [x] local dev callback URL
- [x] GitHub OAuth callback points at the Supabase Auth callback URL.
- [x] Email provider is production-ready.

14 June 2026 note: MCP confirms the live Supabase project `xiiaugllydxxmjbtzfux` is `ACTIVE_HEALTHY` in `eu-west-2` on Postgres 17. The available MCP tools can read advisors and project health, but not the Auth URL configuration.

15 June 2026 note: operator confirmed Supabase Auth Site URL, redirect allow-list, GitHub OAuth, and hosted auth flow work with `https://app.feedbacks.dev`.

## Supabase Database

- [x] Internal staging/recovery projects use the canonical ordered SQL chain through `sql/024`.
- [x] Live project migration history is explained by `docs/2026-06-09-migration-history-reconciliation.md`.
- [x] `public.check_rate_limit(...)` exists and blocks repeated requests.
- [x] Public board vote writes go through server routes, not direct client RLS writes.
- [x] All live public tables have RLS enabled.
- [x] Server-only SECURITY DEFINER functions are executable by `postgres` and `service_role`, not direct clients.
- [x] Security advisor reviewed; no code-side launch work remains in scope.
- [x] Performance advisor findings are reviewed after smoke traffic. Keep unused indexes through launch and review again after sustained real traffic.

## Supabase Storage

- [x] `feedback_screenshots` bucket exists.
- [x] `feedback_attachments` bucket exists.
- [x] Bucket access matches the screenshot and attachment model.
- [x] Screenshot uploads are image-only and capped at 3 MB in live storage.
- [x] Attachment uploads are MIME-limited in live storage and capped at 5 MB by the API.

## Vercel

- [x] Production project root directory is `packages/dashboard`.
- [x] Build command is `cd ../.. && pnpm build`.
- [x] Install command is `cd ../.. && pnpm install`.
- [x] Node.js version is 20 or newer. Vercel currently reports `24.x`.
- [x] Include source files outside root directory is enabled for the monorepo.
- [x] Required env vars exist:
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY`
  - [x] `NEXT_PUBLIC_APP_ORIGIN`
  - [x] `CRON_SECRET`
  - [x] `WEBHOOK_JOB_SECRET`
  - [x] `VOTE_HMAC_SECRET`
  - [x] `BOARD_REPORT_SALT`
  - [ ] Dodo production billing env vars for final go-live
  - [x] captcha env vars if captcha is enabled

14 June 2026 note: local Vercel CLI is installed, but the workspace is not linked to the Vercel project. `vercel env ls production` could not verify env vars without linking the project, and `vercel domains inspect app.feedbacks.dev` failed for the current account.

15 June 2026 note: Vercel CLI was linked to project `feedbacks-dev-dashboard` in team `warriorsushis-projects`. Production deploy `dpl_FYMCZopaR98JDASYzZECsBbFichw` is ready and aliased to `https://app.feedbacks.dev`; GitHub deployment records show Vercel deployed commit `eccd20482645f5a2b0ef4150e434c1b8c2aa150b`.

15 June 2026 env check: `vercel env ls production` shows all required non-billing production env names present, including `WEBHOOK_JOB_SECRET` and `BOARD_REPORT_SALT`. Values are encrypted and were not printed.

## Cron Jobs

- [x] Webhook jobs run every 5 minutes through the GitHub Actions external scheduler. Vercel Hobby deployment keeps a daily fallback because Vercel Hobby rejects sub-daily cron schedules.
- [x] Notification digest cron runs daily.
- [x] Notification digest processing also has a daily GitHub Actions fallback at `13:15 UTC`.
- [x] `CRON_SECRET` exists in Vercel production env so Vercel sends `Authorization: Bearer <CRON_SECRET>` to cron routes.
- [x] `CRON_SECRET` exists in GitHub Actions repository secrets for `WarriorSushi/Feedbacks.dev`.
- [x] Manual internal webhook job processing route is not publicly usable without its secret.

15 June 2026 note: production deploy was blocked by Vercel Hobby plan cron limits when `/api/cron/webhook-jobs` used `*/5 * * * *`. The repo now uses a daily Vercel-compatible fallback. `vercel crons ls` confirms:

- `/api/cron/webhook-jobs` at `0 0 * * *`
- `/api/cron/notification-digests` at `0 13 * * *`

The fast retry path is handled by GitHub Actions while the project remains on Vercel Hobby. Upgrade to Vercel Pro or move to a dedicated queue/worker only if GitHub's best-effort schedule becomes too loose for production traffic.

15 June 2026 GitHub Actions scheduler note: `.github/workflows/process-webhook-jobs.yml` now calls `https://app.feedbacks.dev/api/cron/webhook-jobs` every 5 minutes using the repository `CRON_SECRET`. A direct production probe with the same secret returned HTTP `200` and `{"processed":[]}`. Manual workflow run `27526711513` completed successfully.

## Widget Assets

- [x] `packages/dashboard/public/widget/latest.js` exists after build or copy.
- [x] `packages/dashboard/public/widget/v2.js` exists after build or copy.
- [x] Hosted snippet points to `https://app.feedbacks.dev/widget/latest.js`.
- [x] Public customer snippet points to the hosted app origin.
- [x] `https://app.feedbacks.dev/widget/latest.js` is reachable over valid HTTPS.
- [x] Widget size check passes when widget files change.

## Integrations

- [x] Slack real test send and replay are verified.
- [x] Discord real test send and replay are verified.
- [x] Generic webhook real test send and replay are verified.
- [x] Generic webhook signing headers are documented and verified.
- [x] GitHub Issues real test send and replay are verified.
- [x] Secret URLs and tokens are never shown in full in UI, logs, screenshots, or docs.

14 June 2026 direct external connector smoke pass:

- Slack dummy feedback event delivered with HTTP `200`; user manually confirmed receipt.
- Discord dummy feedback event delivered with HTTP `204`; user manually confirmed receipt.
- Generic webhook dummy event delivered with HTTP `200`; HMAC verified against the exact raw request body.
- GitHub Issues dummy event created issue `#1` in the configured test repository with HTTP `201`; user manually confirmed it.
- 23 June 2026 authenticated production smoke verified dashboard delivery-history and replay for Slack, Discord, generic webhooks, and GitHub Issues. GitHub smoke issues were closed after verification.

## MCP And API

- [x] `pnpm --filter @feedbacks/mcp-server build` passes.
- [ ] Claude Code config is tested.
- [ ] Cursor config is tested.
- [x] Generic MCP stdio config is tested.
- [x] Free plan allows limited MCP/API access.
- [x] Pro plan allows uncapped MCP/API access within product-level operational limits.

23 June 2026 note: generic stdio smoke initialized `packages/mcp-server/dist/index.js` with a placeholder key and verified the server advertises 9 tools. Claude Code and Cursor entries remain operator-client checks because they require those external clients to load a real project config.

24 June 2026 note: production builds now create a versioned MCP package at `/mcp/feedbacks-mcp-server-1.0.0.tgz`. A clean `npm exec --package=<tarball> -- feedbacks-mcp` smoke initialized the packaged server and verified all 9 tools. The package no longer depends on an unpublished npm registry entry.

## Dodo Payments

- [x] Dodo test checkout returns to `/billing` on `https://app.feedbacks.dev`.
- [x] Plan changes only after verified webhook state updates.
- [x] Valid current Dodo webhook passes verification.
- [x] Invalid signature is rejected.
- [x] Stale timestamp is rejected.
- [x] Too-far-future timestamp is rejected.
- [x] Real Dodo Standard Webhooks signature format is confirmed against the implementation.

19 June 2026 note: keep Dodo Payments in test mode until final production launch. User-confirmed test checkout and webhook entitlement updates work. The verified webhook, not the browser return, remains the source of truth for Pro state.

## Browser Acceptance

- [x] Install flow passes.
- [x] Hosted widget verify flow passes.
- [x] Webhook configuration, test send, and replay pass.
- [x] Board submit duplicate/spam checks pass.
- [x] Board moderation reply/status/hide flow passes.
- [x] Board directory category filtering passes.
- [x] Empty, loading, and error states are checked on desktop and mobile widths.
