# Read State And Dashboard Onboarding Plan

Date: 2026-06-21

## Findings

- Feedback inbox rows used `status = new` as the visual unread signal.
- Opening a feedback detail page did not change any read-specific field because no read-specific field existed.
- `status = new` is a workflow state, not a read state. Treating it as unread makes already-opened items continue to look new.
- The dashboard also counted "Unread" from `status = new`, which reinforced the same mismatch.
- New users can understand project setup from the existing first-run flow, but the dashboard does not yet provide a durable product map after the first project exists.

## Decisions

- Add `feedback.read_at timestamptz null` as the read-state source of truth.
- New feedback remains unread by default with `read_at = null`.
- Existing feedback with a non-`new` workflow status should be backfilled as read because it has already been intentionally triaged.
- Opening a feedback item marks it read by setting `read_at` only when it is null.
- Opening a feedback item must not change `status`; `new`, `reviewed`, `planned`, `in_progress`, and `closed` stay intentional workflow states.
- Inbox unread styling should use a restrained background, inset ring, and small dot indicator.
- The inbox can support a clean `read=unread` filter now. Unread counts should come from `read_at is null`, not `status = new`.

## Onboarding Plan

1. First-time guided tutorial
   - Show after a user's first project exists and before the first verified feedback item.
   - Keep it anchored to real pages: project creation, install snippet, hosted verification, inbox, integrations.
   - Avoid a blocking wizard; use a compact guided checklist or coachmark path.

2. Manual "Take product tour" entry point
   - Keep a persistent dashboard action.
   - Launch the same guided path on demand.
   - Store completion/dismissal per user, not globally per project.

3. Dashboard "What you can do" section
   - Keep it compact and link-driven.
   - Cover install, inbox triage, integrations, public boards, API/MCP, and billing.
   - Prefer direct links over explanatory prose.

4. Feature discovery
   - Widget install: project setup and install tab.
   - Inbox triage: inbox empty state, unread filter, status controls.
   - Integrations: dashboard capability link and project integrations tab.
   - Public boards: dashboard boards link and project board settings.
   - API/MCP: API docs link and project API docs tab.
   - Billing: billing link, usage context, and plan labels.

5. Better empty states
   - Projects: create one project, then copy the snippet.
   - Inbox: install, send one test, then triage.
   - Integrations: add one endpoint or use account email alerts.
   - Boards: publish a board only after the project has a clear name and public purpose.
   - API docs: create a project key and keep it out of browser code.
   - Billing: explain current plan, usage, and the next meaningful upgrade reason.

## Implemented First Slice

- Added read/unread state via `read_at`.
- Added a live-safe backfill for existing non-`new` feedback.
- Added an inbox `Unread` filter backed by `read_at is null`.
- Updated dashboard unread counts and links to use `read_at`.
- Added a compact dashboard "What you can do" section.
- Added a manual "Take product tour" entry point that opens a compact inline tour at `/dashboard?tour=1`.

## Next Steps

- Add persistence so the dashboard can remember whether a user has completed or hidden the tour.
- Add persisted tour completion in `user_settings.preferences`.
- Add page-level empty-state copy pass across Projects, Inbox, Integrations, Boards, API docs, and Billing.
- Consider an unread count badge in the inbox filter row after validating the count query cost in Supabase.
