# 10% Better Everywhere: Implementation Plan

This is the working checklist for the product audit completed on 6 July 2026. Work proceeds in severity order. The exposed test-account credential item is explicitly excluded at the owner's request.

## P0: security and release integrity

- [x] Upgrade vulnerable production dependencies and refresh the lockfile. `pnpm audit` reports zero advisories.
- [x] Make the dashboard lint command reliable in a clean workspace.
- [x] Harden outbound webhook delivery against DNS rebinding, redirects, slow endpoints, and in-process retry sleeps.
- [x] Add regression tests for webhook URL validation, redirect handling, and timeouts.

## P1: product and UX

- [x] Make project scope explicit and consistent across project-specific dashboard surfaces.
- [x] Add a deliberate All projects context for cross-project views.
- [x] Put the default quick-install path before optional customization.
- [x] Turn verification into a clear state transition with a direct inbox handoff.
- [x] Reduce duplicated tutorial entry points and prefer contextual help.
- [x] Simplify dashboard decision hierarchy and project-scoped metrics.
- [x] Fix profile display-name consistency.
- [x] Add route-level error and not-found recovery.

## P1: frontend architecture and performance

- [x] Split the largest inbox concerns into focused project-scope, reusable UI, and saved-view components.
- [x] Replace dashboard row scans with project-aware aggregate queries. Migration `025` adds the bounded aggregate; the app keeps a compatibility fallback until it is deployed.
- [x] Add request cancellation and stable loading/error states to client fetches.
- [x] Keep mobile metrics compact without horizontal reading.
- [x] Review touched React components for accessibility, hook correctness, and unnecessary client boundaries.

## P1: backend, testing, and operations

- [x] Expand schema verification to probe required service-only functions in addition to columns and buckets. Full catalog-level RLS/grant inspection remains an operator check.
- [x] Make protected-branch E2E fail closed when its environment is missing.
- [x] Add core inbox, billing, project-scope, and authentication acceptance coverage.
- [x] Add safe request IDs and structured operational logging.
- [x] Add queue-age, cron-heartbeat, submission-success, and delivery-success health signals.
- [x] Enforce request size before parsing public submissions, including chunked bodies.
- [x] Replace the report-only script policy with an enforced per-request nonce policy. Inline styles remain temporarily allowed for React style attributes.

## P2: measured product improvements

- [x] Add privacy-preserving activation funnel counters.
- [x] Add keyboard triage and saved inbox views.
- [x] Add installation-health signals and bounded operational-record cleanup. Customer feedback and media remain owner-scoped with no automatic time purge.
- [x] Consolidate repeated quick actions, help, and tutorial surfaces.
- [x] Establish accessibility, contrast, and responsive regression checks.

## Deployment handoff

- Apply migrations `025`, `026`, and `027` in order before relying on aggregate dashboard stats or activation health in production.
- The app retains a compatibility fallback for dashboard stats, and activation writes fail safely until migration `026` is present.
- Local authenticated Playwright execution requires `E2E_AUTH_BYPASS_SECRET`; CI now fails closed for same-repository branches when that environment is incomplete.

## Success measures

- Median time from signup to first verified submission.
- Percentage of accounts receiving and triaging real feedback within 24 hours.
- Submission and webhook delivery success rates.
- Median unread-to-triaged time.
- Dashboard and inbox p75 latency.
- Mobile overflow and accessibility regression counts.
