# feedbacks.dev Product Implementation Status

Last updated: 2026-06-22

This document tracks the stable product status after the full product audit in `docs/review/2026-06-21-full-product-audit-and-phase-plan.md`. Use it as the short source of truth for what is shipped, what is intentionally deferred, and what should not be promoted as complete yet.

## Implemented

- Drop-in widget install path with generated snippets, setup packets, hosted verification guidance, and browser-safe project keys.
- Widget customization for placement, labels, color, optional fields, rating/type controls, screenshot/attachment behavior, and saved install configuration.
- Feedback inbox with search, filters, bulk status/tag actions, unread filtering, and read/unread state via `feedback.read_at`.
- Feedback detail view that marks an item read without changing workflow status.
- Internal notes, tags, priority, public/private board state, and workflow statuses.
- Dashboard capability discovery with a persistent product tour stored in `user_settings.preferences.productTourCompletedAt`.
- Public boards with submissions, voting, comments/team replies, moderation, reports, announcements, branding, visibility, directory discovery, and visible board follow/unfollow.
- Integrations for Slack, Discord, GitHub Issues, and generic webhooks with endpoint rules, delivery logs, replay, retry jobs, SSRF checks, and optional generic HMAC signing.
- Email notification settings and server-side Resend delivery paths for owner alerts, webhook failure alerts, billing failure alerts, and daily digests.
- Dodo Payments billing state with checkout, portal, verified webhooks, usage limits, and entitlement checks. Dodo remains in test mode until final production launch.
- Project-scoped REST API and MCP server for trusted backend/agent workflows.
- HTML escaping for user-supplied feedback content in notification emails.

## Promises To Avoid Until Implemented

- Linear as a first-class integration.
- Multi-seat team management, assignment queues, mentions, and role-based collaboration.
- AI or automatic recurring-theme detection in the dashboard.
- Public board follower/watcher notification fanout. Follow and watch state exists, but notifications for those state changes are not yet shipped.
- Webhook digest delivery as a promoted feature unless the digest worker is verified end to end.

## Current Product Positioning

Use this language:

- "Drop-in feedback widget"
- "Triage dashboard"
- "Public voting boards"
- "Slack, Discord, GitHub Issues, and generic webhooks"
- "REST API and MCP for trusted agents"
- "Webhook-backed billing truth"

Avoid this language for now:

- "Smart dashboard" when implying automatic intelligence.
- "Assign feedback" or "team discussions" when implying multi-user workflow.
- "Linear integration" unless referring to future roadmap or a generic webhook recipe.
- "Follow updates" unless it is clear that board follow/watch notifications are future work.

## Next Implementation Phases

1. Finish first-run activation: more empty states, persisted tour polish, and a manual tour entry that is easy to find outside the dashboard header.
2. Improve inbox triage: optional mark unread, saved filters, clearer source labels, and public-board actions from detail view.
3. Mature public boards: follower/watcher notifications, moderation queue, tighter card hierarchy, and better sparse board states.
4. Harden operations: generated Supabase types, schema verification, notification cron verification, and production smoke tests.
5. Deepen integrations: decide on Linear, verify webhook digest behavior, and publish tested integration recipes.

