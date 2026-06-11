# Production Deploy Checklist - 9 June 2026

Use this as the launch signoff checklist before connecting Dodo Payments to production traffic.

## Domains

- [ ] `https://feedbacks.dev` serves marketing and docs.
- [ ] `https://app.feedbacks.dev` serves dashboard, API, widget assets, and public boards.
- [ ] `NEXT_PUBLIC_APP_ORIGIN=https://app.feedbacks.dev` in production.
- [ ] Self-hosted docs consistently use `https://your-app-domain.com`.

## Supabase Auth

- [ ] Site URL is set to the production app origin.
- [ ] Redirect URLs include:
  - [ ] `https://app.feedbacks.dev/auth/callback`
  - [ ] local dev callback URL
- [ ] GitHub OAuth callback points at the Supabase Auth callback URL.
- [ ] Email provider is production-ready.
- [ ] Leaked password protection is enabled.

## Supabase Database

- [ ] Fresh projects use the canonical `sql/001` through `sql/015` chain.
- [ ] Live project migration history is explained by `docs/2026-06-09-migration-history-reconciliation.md`.
- [ ] `public.check_rate_limit(...)` exists and blocks repeated requests.
- [ ] Public board vote writes go through server routes, not direct client RLS writes.
- [ ] Security advisor has no unresolved app-side issues.
- [ ] Unused-index performance findings are reviewed after real traffic.

## Supabase Storage

- [x] `feedback_screenshots` bucket exists.
- [x] `feedback_attachments` bucket exists.
- [ ] Bucket access matches the screenshot and attachment model.
- [x] Screenshot uploads are image-only and capped at 3 MB in live storage.
- [x] Attachment uploads are MIME-limited in live storage and capped at 5 MB by the API.

## Vercel

- [ ] Production project root directory is `packages/dashboard`.
- [ ] Build command is `cd ../.. && pnpm build`.
- [ ] Install command is `pnpm install`.
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
  - [ ] billing env vars when Dodo is enabled
  - [ ] captcha env vars if captcha is enabled

## Cron Jobs

- [ ] Webhook jobs cron runs every 5 minutes.
- [ ] Notification digest cron runs daily.
- [ ] Cron requests use `CRON_SECRET`.
- [ ] Manual internal webhook job processing route is not publicly usable without its secret.

## Widget Assets

- [ ] `packages/dashboard/public/widget/latest.js` exists after build or copy.
- [ ] `packages/dashboard/public/widget/v2.js` exists after build or copy.
- [ ] Hosted snippet points to `https://app.feedbacks.dev/widget/latest.js`.
- [ ] Self-hosted snippet points to the self-hosted app origin.
- [ ] Widget size check passes when widget files change.

## Integrations

- [ ] Slack real test send and replay are verified.
- [ ] Discord real test send and replay are verified.
- [ ] Generic webhook real test send and replay are verified.
- [ ] Generic webhook signing headers are documented and verified.
- [ ] GitHub Issues real test send and replay are verified.
- [ ] Secret URLs and tokens are never shown in full in UI, logs, screenshots, or docs.

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
