# feedbacks.dev Product Implementation Status

Last updated: 2026-06-24

This document tracks the stable product status after the full product audit in `docs/review/2026-06-21-full-product-audit-and-phase-plan.md`. Use it as the short source of truth for what is shipped, what is intentionally deferred, and what should not be promoted as complete yet.

## Implemented

- Drop-in widget install path with generated snippets, setup packets, hosted verification guidance, and browser-safe project keys.
- Widget customization for placement, labels, color, optional fields, rating/type controls, screenshot/attachment behavior, and saved install configuration.
- Feedback inbox with search, unified filter pills, project/tag filters, bulk status/tag/read actions, source labels, unread filtering, and read/unread state via `feedback.read_at`.
- Feedback detail view that marks an item read without changing workflow status.
- Internal notes, tags, priority, public/private board state, and workflow statuses.
- Dashboard capability discovery with a guided navigation tour, persisted skip/finish state in `user_settings.preferences`, manual retake entry points in the authenticated sidebar and Settings, focused setup progress, sparse board directory empty states, and verified desktop/mobile sidebar highlighting across all nine tour steps.
- Tutorial Center with focused beginner lessons that explain the setup order and link users into the real product surfaces.
- Public boards with submissions, voting, comments/team replies, moderation tab/report queue, reports, announcements, branding, visibility, directory discovery, visible board follow/unfollow, and follower/watcher email fanout for status changes and team replies.
- Public board request rows and hero hierarchy have been tightened for a calmer, more product-grade scan path.
- Signed-in public board navigation keeps owners inside the app board directory instead of sending them to the public marketing directory.
- Public board directory categories are normalized through a curated category helper, shown with readable labels/counts, and exposed as suggested owner setup chips.
- Public board settings include owner-facing guidance for review cadence, status discipline, and privacy expectations before promotion.
- Integrations for Slack, Discord, GitHub Issues, and generic webhooks with endpoint rules, immediate or daily digest delivery, delivery logs, replay, retry jobs, SSRF checks, optional generic HMAC signing, additive webhook payload versioning, and documented recipes.
- Email notification settings and server-side Resend delivery paths for owner alerts, webhook failure alerts, billing failure alerts, and daily digests.
- Dodo Payments billing state with checkout, portal, verified webhooks, usage limits, and entitlement checks. Dodo remains in test mode until final production launch.
- Project-scoped REST API and MCP server for trusted backend/agent workflows. Production builds package the MCP server as a versioned tarball at `/mcp/feedbacks-mcp-server-1.0.0.tgz`, and the documented `npm exec` command was verified to initialize and advertise all nine tools.
- Generated Supabase database types and a repeatable `pnpm supabase:check` schema/bucket verification command.
- Supabase RLS policy optimization for agent setup audit/token reads via `sql/020_optimize_agent_setup_rls.sql`, applied and verified on the live project.
- Supabase RLS cleanup for `usage_counters` write-deny policies via `sql/021_split_usage_counter_write_rls.sql`, applied and verified on the live project.
- Supabase RLS cleanup for public board, announcement, and public note SELECT policies via `sql/022_consolidate_public_board_read_rls.sql`, applied and verified on the live project.
- Project and account deletion clean up associated screenshot and attachment objects from Supabase Storage before deleting owned records.
- Cron routes write service-role-only `cron_runs` heartbeat rows for webhook retry and notification digest production verification.
- GitHub Actions provides external scheduler fallbacks for webhook retries and daily notification digests while the Vercel project remains on Hobby cron limits.
- Webhook digest delivery stores `webhook_digest_items`, batches daily digest endpoint deliveries through the webhook cron, and records `feedback.digest` delivery logs.
- HTML escaping for user-supplied feedback content in notification emails.
- Production smoke on 23 June 2026 verified the hosted authenticated loop, public board loop, webhook test/replay loop, generic digest loop, REST API list/update loop, hosted verify page, cron audit rows, and mobile density for directory, inbox, integrations, board settings, and billing. Post-push polish smoke on deployment `dpl_H5xCf7tkuX7kWCHhedcYGZvrZh3x` also verified public board, directory, landing, and auth surfaces with no browser console/page errors or mobile horizontal overflow.

## Promises To Avoid Until Implemented

- Linear as a first-class integration.
- Multi-seat team management, assignment queues, mentions, and role-based collaboration.
- AI or automatic recurring-theme detection in the dashboard.

## Current Product Positioning

Use this language:

- "Drop-in feedback widget"
- "Triage dashboard"
- "Public voting boards"
- "Slack, Discord, GitHub Issues, and generic webhooks"
- "Immediate or daily digest webhook delivery"
- "REST API and MCP for trusted agents"
- "Webhook-backed billing truth"

Avoid this language for now:

- "Smart dashboard" when implying automatic intelligence.
- "Assign feedback" or "team discussions" when implying multi-user workflow.
- "Linear integration" unless referring to future roadmap or a generic webhook recipe.

## Next Implementation Phases

1. Operations: continue monitoring scheduled `cron_runs` and webhook backlog under real usage. The 24 June snapshot had no active or failed webhook jobs; the notification digest scheduler now has a GitHub Actions fallback.
2. Performance: repeat unused-index review after sustained production traffic, not just smoke traffic.
3. Billing launch: keep Dodo in test mode until the final go-live decision and production credentials are intentionally enabled.
4. Product polish: continue reducing decorative public-board/landing surfaces where they distract from product proof.
