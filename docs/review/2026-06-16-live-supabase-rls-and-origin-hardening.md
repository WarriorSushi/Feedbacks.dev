# Live Supabase RLS And Origin Hardening

Date: 2026-06-16

## What Was Checked

- Supabase changelog scan for current breaking/security changes.
- Live Supabase project advisors for the `feedbacks.dev` project.
- Public schema table RLS state.
- Public schema security-definer functions and public role execute grants.
- Public schema views/materialized views.

## Live Findings

- Project: `feedbacks.dev`, Postgres 17, active and healthy.
- Security advisor:
  - Warning: leaked password protection is disabled in Supabase Auth.
  - Action: enable leaked password protection in the Supabase dashboard before public launch.
- Performance advisor:
  - Mostly unused-index informational findings.
  - Some duplicate permissive SELECT policy warnings on public-board/notes/usage tables.
  - Action: tune after traffic confirms real query paths; do not remove launch-critical indexes purely because they are unused in a young database.
- RLS:
  - All ordinary and partitioned tables in `public` have RLS enabled.
- Security-definer functions:
  - Several functions live in `public`, but `anon` and `authenticated` do not have execute grants.
  - Action: not an immediate public execution hole, but future cleanup should move privileged helpers into a private schema.
- Views:
  - No public views or materialized views were found.

## Shipped Hardening

Added optional widget origin restriction for production installs:

- Off by default so WordPress, site builders, previews, and first-run setup remain simple.
- Project owners can enable it in project settings after the widget works.
- Allowed origins are strict scheme + host values, for example `https://example.com`.
- Paths, wildcards, and invalid protocols are rejected.
- `/api/feedback` rejects submissions from untrusted origins when restriction is enabled.
- The hosted app origin remains trusted so the verification flow keeps working.

## Acceptance Criteria

- First-run install remains unchanged.
- Existing snippets stay copy-paste compatible.
- Restriction cannot accidentally enable with an empty origin list.
- Server enforces the rule, not just the UI.
- Unit tests cover normalization, sanitization, allowed requests, rejected requests, and trusted hosted verification.

## Follow-Up

1. Enable Supabase leaked password protection.
2. Plan a future migration to move security-definer helpers out of `public`.
3. Revisit duplicate permissive SELECT policies after production traffic gives real query evidence.
4. Continue CSP rollout as the next production hardening item.
