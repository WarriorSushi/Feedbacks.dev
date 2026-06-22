# feedbacks.dev Full Product Audit And Phase Plan

Date: 2026-06-21

Scope: user-facing product, dashboard UX, install flow, feedback triage, public boards, integrations, API/MCP, billing, notifications, backend/data model, security posture, tests, and operational readiness.

## Executive Summary

feedbacks.dev is no longer a thin MVP. The core promise is mostly delivered: a developer can create a project, customize a small feedback widget, copy an install snippet, receive feedback, triage it in an inbox, publish selected feedback to a public board, route events through integrations, and expose the same workflow to trusted API/MCP clients.

The biggest remaining product risk is not missing foundations. It is promise discipline. Some marketed or PRD-level language still implies a broader team workflow than the app currently supports: Linear routing, assignment, team collaboration, recurring issue intelligence, and public board follow/update loops are either not present or not complete enough to promote as finished product capabilities.

The next implementation work should avoid a large tutorial or another all-in-one setup screen. The best path is a staged hardening pass: make first-run activation impossible to miss, make inbox triage feel crisp, make public boards credible and closed-loop, then deepen integrations and API/MCP around the workflows that already exist.

Follow-up on 2026-06-23: Phase 1 through Phase 5 launch-hardening slices were implemented and documented in `docs/product-status.md`. Remaining work is now limited to real-traffic monitoring, Dodo production go-live verification, and post-traffic index review.

## What Is Delivered

| Area | Delivery status | Notes |
| --- | --- | --- |
| Marketing and positioning | Mostly delivered | Landing page clearly emphasizes copy-paste setup, public boards, integrations, API/MCP, and billing. Some copy still risks overpromising "smart" workflow depth. |
| Auth and account basics | Delivered | Magic link/GitHub auth paths exist. Settings support profile, notification preferences, theme, and guarded account deletion. |
| Project creation | Delivered | New project flow is small and avoids bloated setup. Project limit enforcement is wired through billing entitlements. |
| Widget install | Delivered | Website, Next.js, React, Vue, WordPress, HTML-block, mobile/server guidance, setup packets, copy buttons, CSP/SRI notes, and verify path are present. |
| Widget customization | Delivered | Modal, inline, custom trigger, color, labels, rating/type/email/screenshot/captcha-style settings are represented through the project customization flow. |
| Feedback submission | Delivered | Widget route and REST route create feedback with context, rating, tags, screenshot/attachment handling, agent metadata, rate limits, origin allowlists, spam/captcha hooks, and quota enforcement. |
| Inbox triage | Mostly delivered | Search, filters, status, type, tag, project, agent, bulk status/tag actions, unread filter/count, and detail view exist. Read/unread is now separate from workflow status. |
| Workflow status | Delivered | `new`, `reviewed`, `planned`, `in_progress`, and `closed` are implemented without conflating opened/read with reviewed. |
| Internal notes | Delivered for owner workflow | Feedback detail supports internal notes. Multi-member team authorship/roles are not a full product surface yet. |
| Public boards | Mostly delivered | Board settings, public board page, directory, submissions, votes, comments/team replies, moderation, reports, custom branding, visibility, categories, and recommendations exist. |
| Board discovery | Mostly delivered | Public directory supports sorting, categories, search, trust/activity-style scoring, and public board cards. Needs stronger empty/low-supply states and curation rules. |
| Integrations | Mostly delivered | Slack, Discord, GitHub Issues, generic webhooks, rules, delivery formats, logs, replay, HMAC for generic, SSRF checks, retry jobs, and auto-disable are present. |
| Email notifications | Partially delivered | Owner alerts, webhook failure emails, billing failure emails, and daily digest code exist and settings persist. Production readiness depends on Resend env and cron verification. |
| Billing | Mostly delivered | Dodo checkout, portal, webhook-backed entitlement updates, usage limits, return URL handling, and billing UI exist. Dodo should remain in test mode until final production launch. |
| API | Delivered | Project-scoped REST endpoints support submit, list, project stats/details, and status/priority/tag updates with feature gates and history windows. |
| MCP | Delivered | MCP tools cover submit/list/search/update, setup packets, test feedback, project stats, and widget install verification. |
| Security/privacy basics | Mostly delivered | Hashed project keys, service-role server isolation, RLS migrations, webhook SSRF prevention, rate limits, privacy salts, origin allowlists, billing webhook verification, and account deletion guardrails exist. |
| Tests | Good coverage for current stage | Unit coverage includes billing, webhook delivery, read state, submissions, install snippets, origin allowlist, plans, redirects, screenshots. E2E covers install, customize, API docs, boards, webhooks, moderation, directory. |

## Promise Gaps

### P1: PRD Mentions Linear, But Product Does Not Ship Linear

At audit time, the PRD said users could route important items to Slack, Linear, GitHub, or email workflows while the app exposed Slack, Discord, GitHub Issues, generic webhooks, and email account notifications.

Resolved on 2026-06-23: Linear is deferred as a first-class integration. Launch copy and `docs/prd.md` now position generic webhooks as the supported workaround, with `docs/integration-recipes.md` documenting a Linear recipe.

### P1: Public Board Follow/Watch State Is Not A Closed Loop

The schema and routes support `board_follows` and `feedback_watches`, and the public card can show "Watch updates" to signed-in viewers. I did not find a notification path that uses those watch/follow rows when a board item changes status or receives a team reply.

This makes "follow product updates" partially hollow. Either ship watcher emails/in-app notifications or downgrade the copy to "save watched requests" until notifications exist.

Resolved on 2026-06-23: watcher/follower notification fanout now sends status and team-reply updates to board followers and item watchers, with unit coverage in `packages/dashboard/tests/unit/notifications.test.ts`.

### P1: Migration And Production Data Discipline Still Needs A Repeatable Runner

Recent live Supabase work succeeded, but the project still relies on manual SQL files and documented reconciliation. That is manageable for a solo launch, but risky once billing, read state, notification digests, watches, and public boards all depend on schema accuracy.

Next step should be a documented migration ledger workflow with production/staging checks, generated database types, and a release checklist that proves expected columns, indexes, triggers, policies, and buckets.

Resolved on 2026-06-23 for launch: migrations `020` through `024` are applied, generated database types are committed, `pnpm supabase:check` validates the live schema/buckets, and the ops checklist records the manual migration workflow.

### P2: "Smart Dashboard" Overpromises Pattern Detection

The dashboard has useful counts, recent feedback, type distribution, unread state, agent counts, and capability links. It does not yet identify recurring issues, summarize trends, or cluster signal. Marketing and README language should say "triage dashboard" unless a real signal intelligence slice is built.

Follow-up on 2026-06-23: launch copy now uses triage/workflow language for the shipped dashboard. Recurring issue intelligence remains unpromoted.

### P2: Assignment And Team Collaboration Are Not A Complete Surface

README and older docs imply assign/team collaboration. Current product has owner account, internal notes, status, tags, integrations, and public replies, but not team invitations, roles, assignees, mentions, or ownership queues.

This is fine for launch if positioned as developer-first/small-team-owner workflow. Avoid selling it as a multi-seat product until team roles exist.

Follow-up on 2026-06-23: `docs/product-status.md` keeps multi-seat team management, assignment queues, mentions, and role-based collaboration explicitly deferred.

### P2: Public Boards Need More Product Credibility

The public board mechanics are strong, but the experience can be sharpened:

- The hero and directory use large card surfaces and decorative gradients; credible public product boards should feel more like a clear changelog/request ledger than a marketing page.
- Votes, status, team replies, and watch state compete visually. Status and team response should be more important than tag/pill density.
- New or sparse board states need stronger prompts: what a visitor can do, what the team promises, and whether submissions are reviewed before action.
- Board follow is not visible in the hero even though a route exists.
- Report handling exists, but board owners need a clearer review queue and moderation summary.

### P2: First-Run Onboarding Exists, But Is Not Persisted Or Context-Aware Enough

The dashboard now has first-run copy, a capability section, and `/dashboard?tour=1`. This is a safe first slice. It should become a light, persistent product tour with completion state in `user_settings`, a manual "Take product tour" entry, and page-level empty states.

Resolved on 2026-06-23: first-run activation now has persisted tour state, a manual tour entry, setup progress, and page-level empty states without turning install into a wizard.

Do not turn this into a wizard. The install path should stay project-first: customize, install, verify one message.

### P2: API Key Trust Copy Should Be Everywhere It Matters

API docs correctly say keys belong in backend or trusted agent config, not browser code. This warning should also appear in setup packets, MCP docs, copied snippets that include server/API examples, and any generated agent prompt. The browser widget project key is the only browser-safe credential.

### P2: Email Notification Production Readiness Needs Proof

Notification settings and Resend delivery functions exist. Before promoting email notifications as done, verify:

- Resend env is configured in production.
- Daily digest cron is scheduled and monitored.
- Email HTML is escaped or sanitized before untrusted feedback text is interpolated.
- Failure logs include enough non-secret context to debug.
- Unsubscribe/preference expectations are clear in settings and policy copy.

### P3: Free/Pro Messaging Should Match Entitlement Reality

The dashboard, billing page, integrations, API docs, and marketing mostly use the shared plan matrix. Continue treating the matrix as the only source of truth. Any copy that says "instant or digest delivery" should be checked against actual endpoint `delivery` support and digest processing.

## UI/UX Health Score

Using the project UI audit rubric:

| Dimension | Score | Notes |
| --- | ---: | --- |
| Accessibility | 3 / 4 | Many controls use labels/aria labels and semantic buttons. Watch for small controls, custom board buttons, and color-only status interpretation. |
| Performance | 3 / 4 | Dashboard uses parallel server queries and the widget is size-checked. More load testing is needed for public board directories, feedback counts, and webhook job backlogs. |
| Theming | 3 / 4 | Consistent dark-first product surface with restrained accents. Some public/landing surfaces lean into gradient/decorative patterns more than the current product thesis needs. |
| Responsive | 3 / 4 | Core pages use responsive grids and wrapping. Dense filter chips, board cards, and integration editors need mobile QA. |
| Anti-patterns | 3 / 4 | The app largely avoids giant setup screens. Remaining risk is card-heavy public/dashboard surfaces and feature copy that outruns shipped workflows. |

Overall: 15 / 20. This is a credible paid-beta product with launch-hardening work left, not a prototype.

## Backend And Data Audit Notes

- `feedback.read_at` is the right model for read/unread. It should remain separate from `status`.
- Public board submissions insert as normal feedback with `is_public = true`, which is good for a unified inbox/board workflow.
- Webhooks are durable enough for launch direction: endpoint config, delivery logs, queued jobs, replay, auto-disable, and generic HMAC exist.
- Generic webhook SSRF protection is a meaningful trust feature.
- Vote identity uses salted hashed IP, which is privacy-aware. Production salt availability must stay part of deploy checks.
- Screenshot and attachment URLs are public storage URLs. That is operationally simple, but privacy copy and retention controls should be explicit before heavy production use.
- API CORS is open by design for widget/API reachability. Docs must keep repeating that private API keys are not browser credentials.
- Generated DB types are not visible as a enforced workflow. Add them before the schema grows further.

## Testing And Verification Gaps

Existing coverage is better than typical for this stage. The highest-value additions are:

- E2E: first-run user creates project, customizes, installs/verifies, opens inbox, marks read, and changes status intentionally.
- E2E: public board visitor submits, sees duplicate suggestion, votes, signs in, watches a request, owner posts team reply.
- Unit: watcher/follower notification fanout for status and team-reply updates.
- Unit: notification email escaping/sanitization.
- Integration: webhook digest behavior if endpoint `delivery: digest` is truly supported.
- CI/staging: Supabase schema audit command that fails when required columns, triggers, policies, or buckets are missing.

## Phase-Wise Implementation Plan

### Phase 0: Truth-In-Marketing And Release Guardrails

Goal: stop promoting unshipped depth before launch traffic arrives.

1. Align README, PRD launch notes, marketing copy, and dashboard copy with current shipped capabilities.
2. Decide whether Linear is launch scope. If not, move it to roadmap and document generic webhook as the workaround.
3. Replace "smart dashboard" language with "triage dashboard" unless a real recurring-theme feature is added.
4. Audit "follow/watch updates" copy until notification fanout exists.
5. Keep Dodo in test mode until final production launch signoff.

Acceptance:

- No public page claims Linear, assignment, multi-seat teams, watcher notifications, or recurring-issue AI unless implemented.
- Billing copy says webhook-backed entitlement state is source of truth.

### Phase 1: First-Run Activation

Goal: get a new developer to one verified feedback item with minimal thinking.

1. Persist product-tour completion in `user_settings.preferences`.
2. Add a small, persistent "Take product tour" entry point in dashboard help/header area.
3. Add page-level empty states for Dashboard, Projects, Inbox, Integrations, Public Boards, API, Billing, and Settings.
4. Make the project setup progress show only the next useful action: customize, install, verify one message.
5. Add one "copy agent setup prompt" path that includes browser-safe vs server-only credential warnings.

Acceptance:

- First-run path never shows advanced integrations before a project exists.
- A user can dismiss the tour and manually restart it later.
- Empty states teach the next action without becoming a tutorial wall.

### Phase 2: Inbox And Triage Excellence

Goal: make feedback review fast and trustworthy.

1. Keep read/unread separate from status and add a manual "mark unread" action if it fits cleanly.
2. Add saved filters for unread, bugs, public board items, agent-submitted items, and high priority.
3. Improve feedback detail hierarchy: message, context, status/action rail, notes, public-board state.
4. Add "make public / remove from board" actions from feedback detail if current owner flow is too hidden.
5. Add recurring-signal-lite without AI: tag frequency, duplicate/similar message suggestions, and top URLs.

Acceptance:

- Opening feedback clears unread only.
- Status changes require explicit user action.
- Inbox makes it obvious which items came from widget, public board, API, or agent.

### Phase 3: Public Boards Maturity

Goal: make boards credible enough that teams will share them publicly.

1. Add visible board follow/unfollow in the board hero for signed-in visitors.
2. Implement watcher/follower notifications for status changes and team replies.
3. Add owner moderation queue for open reports and recently hidden items.
4. Reduce pill density on board cards; prioritize title, vote count, status, team reply, and updated time.
5. Improve sparse directory/board empty states and category curation.
6. Add owner-facing guidance for public board promises: review cadence, statuses, and privacy expectations.

Acceptance:

- Watching a request has a real outcome.
- Public board owners can handle abuse reports without digging.
- A sparse board still looks intentional and trustworthy.

### Phase 4: Integrations, API, And MCP Depth

Goal: make routing and agent workflows dependable rather than merely available.

1. Add Linear integration or explicitly defer it.
2. Add integration recipes for Linear via generic webhook, Slack, Discord, GitHub Issues, and custom automations.
3. Verify and document endpoint `delivery: digest`; implement digest delivery if currently only stored in config.
4. Add API support for read/unread only if there is a real agent use case.
5. Add API/MCP docs for rate limits, quotas, server-only key handling, and history windows.
6. Add webhook payload versioning and sample events in docs.

Acceptance:

- A developer can connect each promoted destination with one tested recipe.
- API/MCP consumers know which keys are safe where.
- Webhook retries and replay are observable from the UI.

### Phase 5: Security, Privacy, And Operations Hardening

Goal: make production incidents less likely and easier to debug.

1. Add a repeatable Supabase migration/check command and generated database types.
2. Add schema checks for `read_at`, public board settings, watches/follows, billing, notification digests, webhook jobs, and storage buckets.
3. Escape or sanitize untrusted feedback text in email HTML.
4. Review public screenshot/attachment storage policy and add retention/deletion controls.
5. Add production smoke tests for widget submission, board submission, billing webhook, webhook queue processing, and API/MCP.
6. Add monitoring for webhook job backlog, notification digest failures, billing webhook rejects, and rate-limit spikes.

Acceptance:

- Release cannot proceed with a missing migration.
- No untrusted feedback content is inserted into email HTML unsafely.
- Operational dashboards cover the routes that affect paid customers.

### Phase 6: Product Polish And Positioning

Goal: make the product feel sharper without growing the surface area.

1. Tighten landing headline and proof: "install in minutes", "copy-safe snippet", "public boards when ready", "API/MCP for agents".
2. Replace decorative public-board/landing gradients where they distract from product proof.
3. Improve mobile density in filters, integrations, board cards, and billing settings.
4. Add concise docs for "recommended first install" vs "advanced customization".
5. Add customer-facing changelog/release notes once public boards and notifications mature.

Acceptance:

- The first viewport always explains the actual product.
- Product UI stays calm, dense, and developer-trustworthy.
- Advanced customization remains separated from quick install.

## Recommended Next Sprint

1. Fix copy drift: Linear, smart dashboard, assignment/team collaboration, watcher notifications.
2. Persist dashboard tour completion and add manual tour entry.
3. Implement board follow button plus watcher/follower notification fanout.
4. Add email HTML escaping tests.
5. Add Supabase schema check/generation workflow.
6. Run full verification: `pnpm type-check`, `pnpm lint`, `pnpm test:unit`, and targeted E2E for install, inbox, boards, and webhooks.
