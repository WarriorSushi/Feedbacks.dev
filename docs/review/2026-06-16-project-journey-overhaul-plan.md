# Project Journey Overhaul Findings And Plan

Date: 2026-06-16

## Findings

- The project detail tabs are already separate enough to keep: Install, Customize, Integrations, Public Board, API, and Settings.
- New project E2E coverage already expects the user to land on Customize first, but the project header and install copy still describe an install-first journey.
- Customize has the right saved/draft model, but the copy uses internal language such as "Install uses Inline" and "Preview matches saved install."
- The preview shell spends space on fake app skeleton UI that does not help the user understand the feedback form.
- Install is still too documentation-like. The code block should contain only copyable code, with guidance outside it.
- Integrations are implemented for Slack, Discord, GitHub Issues, and generic webhooks, but Free users are blocked because `PLAN_MATRIX.free.webhooks` is false.
- API and MCP routes exist, but the project API page frames them as Pro-only and omits the `GET /api/v1/projects` route that the MCP server uses.

## Decisions

- The fresh-user journey is Customize, Install, Verify, Inbox.
- Existing project tabs remain intact.
- Free users get real limited access to API, MCP, and webhooks.
- Free webhook access means one active endpoint total and the latest 10 delivery logs.
- Pro keeps unrestricted endpoint count and broader delivery history.
- Native mobile remains guidance-only: the browser script does not run in native app views unless injected into a WebView.

## Acceptance Criteria

- A new user sees a setup progress rail before the project tabs.
- Customize explains saved vs unsaved state in user language.
- The live preview stays visible as a sticky side panel on desktop.
- The fake browser/skeleton preview wrapper is removed.
- Unsaved customize changes expose a sticky bottom save bar and a normal bottom save button.
- Install uses a guided stepper with visible platform selection.
- Install code blocks contain only code.
- WordPress and HTML block guidance reuse the Website snippet without mixing prose into the code.
- Mobile install guidance clearly says native apps need API, SDK, or WebView guidance.
- Agent setup and security hardening start collapsed.
- Free users can configure one active integration endpoint and see the endpoint usage limit.
- The backend rejects Free webhook configs with more than one active endpoint.
- API docs are usable on Free and organized around quick start first.

## Verification

- Run `pnpm type-check`.
- Run `pnpm lint`.
- Run `pnpm test:unit`.
- Run targeted E2E specs for install, customize, integrations, and API when the local E2E environment is ready.
