# Production Readiness And Dashboard QA Audit

Date: 2026-06-16

## Scope

This pass covered the two urgent tracks:

1. Production readiness: auth redirects, baseline security headers, public submission abuse controls, API key surfaces, billing/webhook enforcement, Supabase/RLS posture from the repo SQL chain.
2. Authenticated dashboard QA: visible feedback for save/error actions, loading/error affordances, empty state clarity, and first-run navigation continuity.

## Findings

### Fixed in this pass

- Auth redirect sanitization:
  - Password sign-in previously trusted the `redirect` query directly in the browser.
  - A malicious absolute URL could send signed-in users away after password login.
  - Added `sanitizeRedirectPath()` and applied it to password, magic link, GitHub OAuth, and callback redirects.

- Global dashboard toasts:
  - Many dashboard actions already called `toast(...)`, but `<Toaster />` was not mounted.
  - Save, delete, billing, integration, feedback triage, and customize errors could appear to do nothing.
  - Mounted the toaster globally in the root layout.

- Baseline security headers:
  - Added `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`, and HSTS via `next.config.js`.
  - Deferred CSP because widget previews, captcha providers, Next runtime scripts, and install surfaces need a separately tested policy.

### Already covered before this pass

- Service role key is server-only in `createAdminSupabase`.
- Runtime env validation exists through `src/lib/env.ts`.
- Free project limit is now 2 in the shared entitlement matrix.
- Free API/MCP/webhooks are available with limits.
- Free webhook endpoint cap is enforced server-side.
- Free webhook delivery history is capped through entitlement logic.
- Dodo webhooks verify signatures and timestamp tolerance.
- Webhook deliveries support HMAC signing for generic endpoints.
- Setup packet tokens have audit/revocation SQL support.
- Public board votes are server-managed in the latest SQL chain.
- Public widget and board submissions have rate limiting.

### Remaining live-production checks

- Supabase live RLS/advisors:
  - Run Supabase security and performance advisors against the live project after the latest SQL chain is applied.
  - Confirm no exposed public-schema tables are missing RLS.
  - Confirm no SECURITY DEFINER functions are executable by `anon` or `authenticated` unless intentionally safe.
  - Confirm any views exposed through the Data API use `security_invoker = true` or are not exposed.

- Origin allowlist behavior:
  - The widget submission endpoint intentionally uses wildcard CORS for copy-paste installs.
  - Project `domain` is collected, but not yet enforced as a hard origin allowlist.
  - Recommended launch position: keep wildcard CORS for first-run install, then add an optional "Restrict to these origins" setting rather than silently breaking WordPress/site-builder installs.

- CSP:
  - Add a tested CSP after mapping the actual script/connect/img/style needs for the dashboard, public boards, widget preview, captcha providers, and Dodo redirects.

- Rate limiting:
  - Current IP extraction rejects requests with no identifiable IP and prefers Vercel headers.
  - Verify production proxy headers on Vercel so legitimate users are not grouped into the same bucket.

## Dashboard QA Notes

- Empty states are mostly task-oriented now: projects, feedback inbox, integrations, and install screens point users to the next action.
- The largest "nothing happened" problem was missing toast mounting, now fixed.
- Route navigation still depends on server-rendered pages and Supabase calls, so some transitions can take a moment. Existing sidebar pending spinners and click depressions help, but deeper speed work should focus on query count and prefetching.
- Signed-in public board detail pages now render inside the app shell, so users can return to the dashboard without losing orientation.

## Acceptance Criteria For This Pass

- Auth redirect inputs cannot leave the current origin.
- Dashboard toast feedback is visible globally.
- Baseline security headers are emitted by Next.
- Unit tests cover redirect sanitization.
- Type-check, lint, unit tests, and production build pass.

## Recommended Next Pass

1. Live Supabase advisor/RLS verification.
2. Optional origin restriction setting for widget submissions.
3. CSP design and staged rollout.
4. Dashboard performance pass: reduce duplicate server/client Supabase reads on navigation-heavy screens.
