# CSP And Dashboard Performance Pass

Date: 2026-06-16

## CSP Rollout

Decision: ship CSP as `Content-Security-Policy-Report-Only` first.

Why:
- We can see real violations in production without breaking signup, dashboard, widget preview, Supabase, Dodo redirects, screenshots, or public boards.
- Next.js and React still need inline script/style allowances unless we do a deeper nonce/hash pass.
- Enforcing too early risks breaking customer installs or dashboard flows silently.

Implemented:
- Added a global report-only CSP header in `packages/dashboard/next.config.js`.
- Added `/api/security/csp-report` to receive and log reports.
- Kept strict structural directives: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`.
- Allowed known required sources for API/image connections from the app origin and Supabase origin.

Next enforcement steps:
1. Watch Vercel logs for `[security] CSP report-only violation`.
2. Add any missing legitimate sources intentionally.
3. Remove unnecessary allowances where possible.
4. Convert to enforced `Content-Security-Policy` only after real production traffic is clean.

## Dashboard Performance Pass

Findings:
- Sidebar and project menus are always visible, so automatic viewport prefetch can eagerly pre-load many routes and dynamic project tabs.
- The dashboard layout fetched all enabled public board settings, then only used slugs for the signed-in user's projects.
- Sidebar pending navigation state reset on pathname changes, but not reliably on query-only tab changes.
- Sidebar selected project state depended on a server-provided project id that can be missing or stale during client navigation.

Implemented:
- Disabled automatic viewport prefetch for always-visible sidebar/project-navigation links.
- Kept hover/focus/click prefetch so intentional navigation still feels quick.
- Reset sidebar pending states on full href changes, including query changes.
- Derived current project selection from the client pathname when server path metadata is unavailable.
- Limited public board slug fetching to the signed-in user's project ids.

Acceptance criteria:
- CSP is visible in response headers as report-only.
- CSP reports can be accepted without auth.
- Sidebar click feedback clears after query-tab navigation.
- Sidebar project selection follows the URL.
- Dashboard shell no longer queries all public boards for every signed-in user.
