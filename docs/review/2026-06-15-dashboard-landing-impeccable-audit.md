# Dashboard and Landing UI Audit

Date: 2026-06-15

Scope: dashboard shell, dashboard overview, feedback inbox, feedback detail notes, projects list, global theme tokens, landing page hero, landing install strip, AI agent messaging.

## Executive Summary

The product direction is strong: the docs are clear that feedbacks.dev must win on quick install, developer trust, fast time-to-value, and small product surface. The current UI already supports that thesis, but the dashboard was too low-contrast in dark mode and the landing hero did not yet create enough urgency or explain the upcoming AI-agent setup path clearly enough for vibe coders.

This pass made the first improvements:

- Increased contrast between dashboard background, cards, muted panels, inputs, and borders in both themes.
- Added a slightly tinted dashboard workspace surface in light mode while keeping dark mode deep and scannable.
- Removed side-stripe emphasis patterns from key dashboard states and replaced them with full-border plus tint states.
- Reworked the landing hero around a sharper promise: catch feedback where it happens.
- Added a Mac-style agent handoff/code window that explains how an AI builder could receive setup instructions.
- Reframed AI copy so the current API is honest and the future agent setup flow is visible.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|---:|---:|---|
| 1 | Accessibility | 3 | Most controls have labels and semantic buttons, but emoji-only visual cues and compact touch targets need another pass. |
| 2 | Performance | 3 | Mostly lightweight, but animated terminal/widget surfaces should be checked on low-end devices and reduced-motion paths. |
| 3 | Responsive Design | 3 | Mobile nav, horizontal filter rails, and compact cards exist, but dense bulk actions and hero preview need more viewport QA. |
| 4 | Theming | 3 | Token system is in place and improved, but project/widget preview components still use hard-coded preview colors by design. |
| 5 | Anti-Patterns | 3 | Side-stripe accents were present and are now reduced. Repeated card sections still need more rhythm in later phases. |
| Total |  | 15/20 | Good, address weak dimensions before launch polish. |

## Anti-Patterns Verdict

Pass with caveats. The app does not read as generic AI output overall, because the install-first product logic is specific and credible. The main risks are:

- Landing sections still rely on repeated card grids after the hero.
- Some public/marketing sections use familiar SaaS shapes that need stronger pacing.
- The dashboard had side-stripe state accents, which are now removed from the audited dashboard paths.
- Emoji state cues help quickly, but should not be the only signal for type or empty states.

## Detailed Findings

### P1: Dark dashboard surfaces were too close together

Location: `packages/dashboard/src/app/globals.css`, dashboard cards and shell

Category: Theming, Accessibility

Impact: In dark mode, cards, boxes, and page background did not separate enough, making dashboard scanning slower.

Recommendation: Maintain at least three visible elevation layers: page shell, card, and nested muted control. This pass increased dark card, muted, border, input, and muted-foreground separation.

Status: Improved in this pass.

### P1: Landing hero did not explain the full product fast enough

Location: `packages/dashboard/src/app/page.tsx`

Category: UX Copy, Information Architecture

Impact: The earlier hero was accurate but calmer than the category demands. It led with install speed, but not enough emotional urgency or agent-ready differentiation.

Recommendation: Lead with the pain users already have: feedback is happening but not captured. Then show two setup paths: paste the snippet yourself or hand the setup packet to an AI agent.

Status: Improved in this pass.

### P1: AI-agent setup promise needs internal product definition

Location: landing page plus product docs

Category: Product UX, Technical Direction

Impact: The homepage can excite vibe coders only if the internal product work is explicit: scoped keys, agent-readable instructions, verify flow, and API permissions.

Recommendation: Track the feature as a first-class product workflow with API, dashboard, docs, and security requirements.

Status: Documented in `docs/2026-06-15-vibe-coder-agent-setup-plan.md`.

### P2: Side-stripe state styling weakens the design system

Location: dashboard overview, feedback inbox, feedback detail notes

Category: Anti-Pattern, Theming

Impact: Colored side stripes are a repetitive visual shortcut and can look less mature than the rest of the dashboard.

Recommendation: Use full borders, subtle state tints, icons, and labels instead.

Status: Improved in this pass for audited dashboard paths.

### P2: Dashboard is compact, but some controls need touch-target review

Location: feedback filter pills, bulk action bar, mobile quick actions

Category: Responsive, Accessibility

Impact: The product is correctly dense, but some mobile controls may be harder to tap quickly.

Recommendation: In Phase 2, test inbox and project flows at 360px, 390px, 768px, and desktop widths in both themes.

### P2: Repeated card grids still flatten the landing page rhythm

Location: feature grid, why section, pricing

Category: Brand, Layout

Impact: The hero is now stronger, but below-the-fold sections still rely on repeated cards.

Recommendation: In Phase 2, turn at least one repeated grid into a workflow diagram, proof strip, or install-to-inbox story.

### P3: Component-library use should be selective

Location: design system direction

Category: Maintainability

Impact: Aceternity and Magic UI are strong for landing motion and visual hooks, but too much animation would fight developer trust.

Recommendation: Use shadcn-style primitives for product UI. Borrow Aceternity/Magic UI-style effects only for hero/brand moments. Evaluate COSS/Origin-style components for advanced primitives if a future dashboard flow needs them.

## Positive Findings

- The product docs give a clear hierarchy: create project, copy snippet, verify install, triage feedback.
- The app already uses shadcn-like primitives, Radix, Tailwind tokens, and lucide icons consistently.
- The dashboard information density fits the task.
- The homepage already includes real install snippets, which is a major trust signal.
- The terminal component already has the Mac-style window treatment requested for developer credibility.

## Three-Phase Work Plan

### Phase 1: Contrast, Hero, and Messaging

Goal: Make the product feel sharper immediately without changing routes or data flows.

Completed in this pass:

- Increase light and dark theme surface contrast.
- Give the dashboard main area clearer panel separation.
- Replace audited side-stripe states with full-border/tint treatments.
- Rework landing hero copy and layout.
- Add agent handoff window to make the vibe-coder path visible.
- Clarify AI API versus planned agent setup handoff.

Recommended verification:

- Run type-check and lint.
- Browser-check landing, dashboard, inbox, projects, and feedback detail in both themes.
- Check the hero at mobile, tablet, and desktop widths.

Implementation update, later on 2026-06-15:

- Verified desktop light, desktop dark, and mobile landing render.
- Fixed mobile horizontal overflow in the install/code strip.
- Kept the dev server stopped after verification.

### Phase 2: Dashboard UX Polish

Goal: Improve scan speed and first-run confidence across the full authenticated product.

Work:

- Audit every dashboard route in both themes with screenshots.
- Normalize empty states so each teaches the next action.
- Improve mobile bulk actions and filter rails for touch.
- Reduce emoji-only semantics by pairing icon, label, and accessible text.
- Tune project cards so API key, domain, feedback count, and next action are clearer.
- Add dashboard-level visual QA notes for billing, settings, project detail, install, customize, integrations, board settings, verify, and API docs.

Acceptance criteria:

- No major contrast failures in either theme.
- No key dashboard action depends on color alone.
- Mobile inbox can filter, select, and bulk-update without crowding.
- Install snippet remains the most prominent project setup action.

Implementation update, later on 2026-06-15:

- New project creation now lands on the Install tab, not Customize.
- Install is now the default first project tab.
- Project creation keeps the project name as the primary field and moves domain into an optional disclosure.
- Project cards route to install and show clearer feedback/install actions.
- Inbox bulk actions use a mobile-safe horizontal action tray.
- Billing and settings panels use stronger tokenized panel contrast.

### Phase 3: Landing Narrative and Agent Setup Productization

Goal: Turn the homepage into a memorable product story while keeping copy-paste trust.

Work:

- Replace one repeated card grid with an install-to-inbox story section.
- Add a non-technical explanation of "what the widget does" without diluting developer accuracy.
- Add an agent setup CTA once the backend flow exists.
- Add proof moments: example inbox item, public board preview, webhook delivery log, and MCP command.
- Consider selective Aceternity/Magic UI-inspired motion for spotlight, beam, or reveal effects with reduced-motion fallbacks.
- Keep shadcn-style primitives for dashboard surfaces.

Acceptance criteria:

- A visitor understands the product in under 30 seconds.
- A vibe coder understands that their AI agent can eventually do the setup work.
- A skeptical developer sees exact code and API names before being asked to sign up.
- The homepage feels exciting but not scammy.

Implementation update, later on 2026-06-15:

- Added a dedicated code-first versus AI-agent setup section on the landing page.
- Added a copyable agent prompt to the project Install tab using the same canonical snippet data as the dashboard.
- Replaced the repeated how-it-works card row with a directional install-to-inbox timeline.
- Continued the docs-driven public surfaces pass:
  - Public board hero now uses an immersive branded accent treatment instead of a compact app-header treatment.
  - Public board body is a focused single-column composition with updates, request list, related boards, and powered-by/manage footer.
  - Related boards now prefer public display names.
  - Board directory now has a dedicated public nav and stronger discovery hero while keeping only real board/request/reply counts.

Screenshot response update, later on 2026-06-15:

- Reduced the landing hero to a shorter, more general promise: collect feedback in minutes and route it anywhere.
- Replaced the cramped hero preview stack with a two-tab showcase for manual snippet install and AI-agent handoff.
- Simplified the quick-start section so it clearly says what to copy: the Website snippet.
- Added wrapping support for code and prompt blocks where horizontal scrolling hurt comprehension.
- Adjusted the secondary feature grid so the fifth feature no longer sits alone on desktop.
- Reworked the final CTA contrast so the GitHub button is readable without hover.
- Replaced the awkward board-directory headline with clearer public-board discovery copy.

Landing simplification update, later on 2026-06-15:

- Cut the landing narrative down to hero, quick install, widget preview, workflow, pricing, and CTA.
- Moved the feedback widget preview into its own section with customization and placement messaging.
- Removed repeated deep-dive sections for setup paths, API, webhooks, "how it works", and broad "why" copy.
- Reduced hero padding and replaced the hero mini-card grid with short trust chips.
- Capped copyable code and prompt windows so they stay useful without stretching the page.

## Component Library Direction

Research snapshot from 2026-06-15:

- shadcn/ui remains the right foundation for the dashboard because it is open code, accessible by default when used properly, and already matches the repo.
- Aceternity UI is useful for animated landing components and hero moments, but should be used selectively.
- Magic UI is useful for landing-page motion and shadcn-compatible visual effects, especially if copied locally and simplified.
- COSS/Origin-style component collections are worth watching for advanced app primitives, but should not replace the existing product system without a specific need.

Decision: keep the dashboard restrained and product-grade. Use brand-surface motion only where it reinforces the install or agent handoff story.
