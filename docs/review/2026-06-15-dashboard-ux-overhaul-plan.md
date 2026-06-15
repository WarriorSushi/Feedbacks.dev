# Dashboard UX Overhaul Plan

Date: 2026-06-15
Branch: `codex/dashboard-ux-overhaul`

## Context

This pass focuses on authenticated product UI only. The product scene is a developer using a laptop during a normal build session. They want to install the widget, prove one feedback item reaches the inbox, then decide whether to customize, route, publish, or automate.

## Findings

1. Install overview uses equal-height card grids for uneven content. The short step labels stretch to match the tall "wired to" panel, creating large blank boxes with almost no information.
2. The auth page still exposes GitHub and magic link only. Supabase password sign-in may be enabled, but the dashboard UI gives no way to use the test email/password path.
3. First-run screens still spend too much surface area explaining the product after sign-in. New users need one dominant path: create project, copy Website snippet, verify inbox.
4. Project cards use `h-full` grid cards. This repeats the same stretched-card problem when project names, domains, and counts have different lengths.
5. Empty states use large emoji and generic copy in several places. That feels less operational than the rest of the product and weakens developer trust.
6. Billing, settings, and agent setup use nested panels and repeated cards where rows, strips, and compact sections would scan faster.
7. Mobile behavior is mostly usable, but some filters, action bars, and tab/page headers need stronger touch-target consistency and less horizontal decision clutter.

## Decisions

1. Replace equal-height step grids with compact vertical task rows or wrapping command strips.
2. Keep quick install and advanced customization separate. Install stays focused on Website snippet, verification, and saved mode. React, Vue, CSP, SRI, and agent setup remain secondary.
3. Restore password sign-in as the primary email path, with magic link as a secondary option.
4. Use fewer full cards. Prefer page headers, bordered rows, section strips, compact tables, and progressive disclosure.
5. Replace emoji-led empty states with lucide icons and direct next-action copy.
6. Make project lists row-based instead of equal-height card grids.
7. Keep the color strategy restrained: neutral surfaces, crisp borders, green only for primary actions, active state, and success.

## Execution Plan

1. Auth: add email/password sign-in and keep magic link as an alternate action.
2. Install tab: rebuild the top install surface into a compact action panel, remove stretched step cards, tighten agent setup, and keep framework/security guidance collapsed.
3. Dashboard and projects: simplify first-run onboarding and convert project cards to dense rows.
4. Inbox and detail: replace emoji empty states and tighten list/action states.
5. Billing/settings/API: reduce nested cards, normalize sentence-case labels, and improve scan density.
6. Verify locally with the test account, desktop and mobile viewports, then run type-check, lint, and build.

## Executed In This Pass

- Added password sign-in to the auth page so `test@test.com` / `testtest` and future password users have a visible path.
- Rebuilt the project install overview into a compact action panel with vertical setup rows.
- Replaced stretched project cards with a dense project list.
- Replaced emoji-led dashboard, inbox, and detail icons with lucide product icons.
- Converted billing summary cards and settings notification boxes into compact divided rows.
- Verified the revised install route with the test account in the in-app browser. Desktop and mobile probes showed no horizontal overflow on the revised install route.
- Ran `pnpm --filter @feedbacks/dashboard type-check`, `pnpm --filter @feedbacks/dashboard lint`, and `pnpm --filter @feedbacks/dashboard build`.

## Remaining UX Follow-Up

- Board settings and API docs received a dedicated density pass in commit follow-up. API examples now use progressive disclosure, and board settings now use compact rows, clearer settings labels, and token-based dark-mode text.
- Headless Playwright did not complete the Supabase password redirect in local dev, although the in-app browser login succeeded. This should be revisited if we add auth E2E coverage for password login.
