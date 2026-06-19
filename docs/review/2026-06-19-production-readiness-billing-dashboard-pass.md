# Production Readiness, Billing, And Dashboard Pass

Date: 2026-06-19

## Current Decision

Dodo Payments stays in test mode until the product is ready for final production launch. The production-grade behavior we want now is:

- checkout can run in Dodo test mode
- Pro access is granted only from verified Dodo webhook state
- cancel, hold, failure, and expiry states remove Pro entitlements
- the dashboard explains this clearly
- the app origin remains `https://app.feedbacks.dev` for dashboard, API, widget, and billing callbacks

## Findings

- Dodo webhook verification matches Standard Webhooks headers and accepts Dodo `whsec_` secrets in raw or decoded form.
- Billing return URLs are canonicalized to the app origin, so checkout returning to `app.feedbacks.dev` is expected.
- Free now includes limited API, MCP, and webhook access. Older docs and legal copy still described those as Pro-only.
- Free integration delivery history should show the latest 10 deliveries. Pro should show a broader operational window; the route was falling back to 30 for Pro because `null` was treated as the default.
- Terms and privacy pages needed a real support/contact email.

## Changes Made In This Pass

- Added a delivery-log limit helper:
  - Free: entitlement cap, currently 10
  - Pro: broader operational query window, currently 100
  - billing unavailable: safe default, currently 30
- Updated Terms and Privacy copy for June 2026 and `pashaseenainc@gmail.com`.
- Updated pricing/legal language so Free limited API/MCP/webhook access is accurately described.

## Dashboard QA Checklist

- [x] Sign in locally as `test@test.com`.
- [x] Confirm dashboard empty states explain where to start.
- [x] Confirm billing page explains webhook-based entitlement truth.
- [x] Confirm project setup flow remains Customize -> Install -> Verify -> Inbox.
- [x] Confirm API and MCP page is visible on Free and does not use Pro-only lock copy.
- [x] Confirm integrations page shows Free limited endpoint usage.
- [x] Confirm public boards inside the dashboard keep the user oriented.
- [x] Add signed-in return bar on public board detail pages so logged-in users can get back to Dashboard, Public Boards, or project board settings.

## MCP / AI Agent Checklist

- [x] MCP package builds.
- [x] Tool list matches docs:
  - `list_projects`
  - `get_project_setup_packet`
  - `verify_widget_install`
  - `submit_test_feedback`
  - `submit_feedback`
  - `list_feedback`
  - `search_feedback`
  - `update_feedback_status`
  - `get_project_stats`
- [x] Setup packet endpoint returns canonical snippets and short verification steps.
- [x] Server-side API key guidance remains clear.
- [x] Local stdio MCP client successfully called:
  - `list_projects`
  - `get_project_setup_packet`
  - `submit_test_feedback`
  - `verify_widget_install`

## Browser Notes

- First local route compile can take several seconds in `next dev`; warmed routes are much faster.
- Local `.env.local` intentionally uses `https://app.feedbacks.dev` as the app origin. For localhost auth QA, run a separate dev server with `NEXT_PUBLIC_APP_ORIGIN=http://localhost:<port>`.
- Clean Playwright QA used the local test-session route to avoid Supabase callback origin mismatch during local-only verification.

## Still Required Before Live Billing

- Switch Dodo product and webhook endpoint from test to live only when the product is ready.
- Confirm live Dodo webhook endpoint uses:
  - `https://app.feedbacks.dev/api/billing/webhook`
- Keep Supabase Auth production Site URL and callback allow-list on:
  - `https://app.feedbacks.dev`
  - `https://app.feedbacks.dev/auth/callback`
- Run final production checkout with a real Pro subscription after the Dodo environment switch.
