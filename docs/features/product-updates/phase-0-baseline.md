# Phase 0 baseline: navigation and widget size

Captured: 2026-07-18

This safety-net baseline records the production navigation before the Product
Updates information-architecture redesign. It does not change application
routes, module activation, database schema, or widget behavior.

## Current navigation

- Desktop and tablet show the persistent sidebar: Dashboard, Feedback,
  Projects, Integrations, Public Boards, and API; Billing, Settings, and Docs
  remain in Account & help.
- Project pages retain the sticky horizontal project menu and query-tab URLs:
  `install`, `customize`, `integrations`, `board`, `updates`, `api`, and
  `settings`.
- Mobile replaces the desktop sidebar with a top bar and slide-in navigation
  drawer.
- Project switching retains the active legacy `?tab=` value. The unit route
  fixture records the approved Phase 1 destination for every current tab.

## Reproducible screenshots

Run the focused E2E test to write the desktop, tablet, and mobile screenshots
to Playwright's ignored test output directory:

```bash
pnpm exec playwright test packages/dashboard/tests/e2e/navigation-baseline.spec.ts
```

The capture uses a temporary non-production test project and does not deploy
or mutate production.

## Widget size

Baseline captured with `pnpm widget:build && pnpm widget:check-size`:

| Asset | Raw | Gzip | Limit |
| --- | ---: | ---: | ---: |
| `widget.js` | 48,020 bytes | 14,062 bytes | 20,000 bytes gzip |

## Deferred work

The approved stable routes, redirects, grouped sidebar, and removal of the
horizontal project menu remain Phase 1 work. The shared activation-event names
are reserved only; this phase does not emit or persist them.
