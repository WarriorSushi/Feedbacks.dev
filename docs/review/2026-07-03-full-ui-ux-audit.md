# feedbacks.dev UI/UX Audit

Date: 2026-07-03

## Scope

Reviewed the deployed product and the local production build with the disposable test account across:

- Dashboard, inbox, projects, project setup, integrations, API, billing, tutorials, settings
- Owner public-board directory, public directory, and a live public board
- 1440x900 desktop and 390x844 mobile viewports
- Light and dark themes on the primary authenticated surfaces
- Loading states, horizontal overflow, browser errors, control labels, and mobile target sizes

No console/page errors or horizontal viewport overflow were found on the tested routes.

## Follow-Up Implemented

The 3 July follow-up completed the five requested audit priorities:

- Public discovery now renders 24 boards per page instead of all 204 at once.
- The authenticated Public Boards route is a management-first owner view, separate from global discovery.
- Seven real-surface spotlight tutorials support route changes, progress, resume, retake, and completion without practice-mode replicas.
- Search and sort controls have accessible names; mobile filter and project-tab rails expose overflow with edge fades and snap points.
- The redundant sidebar project tree was removed, setup steps were compacted on mobile, and dark surfaces now use a clearer neutral elevation scale.

The final polish follow-up also completed the remaining lower-priority items:

- Dashboard help now adapts to activation: one setup action before first feedback, compact tutorial access afterward.
- The public directory mobile hero and controls are compressed so search and browsing begin substantially earlier.
- Project choice persists across routes; Integrations and API provide searchable lists with the current project first.
- Primary routes have distinct browser titles, and key compact mobile controls now use 40-44px targets while desktop density stays unchanged.

## Scores

| Area | Score | Summary |
| --- | ---: | --- |
| Accessibility | 2.5/4 | Semantics are generally sound, but several search/filter controls have no persistent accessible label and many compact controls are below the preferred 44px mobile target. |
| Performance UX | 2.5/4 | Core authenticated pages settle quickly, but the board directory renders every board at once. |
| Responsive UX | 3/4 | Layouts do not overflow, but clipped horizontal control rails provide weak discovery on mobile. |
| Theming | 2.5/4 | Light mode has clear hierarchy; dark mode compresses canvas, cards, and borders into a narrow olive-black range. |
| Interaction design | 2.5/4 | Core actions are understandable, but project navigation, board ownership, and tutorials have avoidable cognitive load. |

## Priority Findings

### P1 - Paginate the public board directory

The directory renders all 204 boards. The measured document height was 26,165px on desktop and 60,537px on mobile. This increases rendering cost, makes the footer effectively unreachable, and turns browsing into an endurance task.

Render 20-24 results initially, keep filtering server-backed, and add either explicit pagination or a deliberate "Load more" action. Preserve the result count and current filters in the URL.

### P1 - Make owner boards a management surface

`/dashboard/boards` currently presents the same global discovery directory inside the authenticated shell. A user choosing "Public Boards" from the dashboard expects their boards, publication state, moderation needs, and management actions first.

Make this route a compact "Your boards" view. Put global discovery behind a distinct "Browse all boards" action. Keep project board settings and the public board preview directly reachable from each owner row.

### P1 - Turn topic tutorials into actual guided lessons

The Tutorial Center is visually clear, but most lessons are cards that deep-link into a real surface. They do not provide step-by-step guidance, progress, resume state, or a clear completion moment. This does not yet satisfy the promise of multiple tutorials for project creation, form customization, installation, inbox triage, boards, and routing.

Use the existing guided-tour overlay system for short, task-specific lessons. Each lesson should explain one action at a time, highlight the relevant control, survive route changes, allow skip/resume, and return to Tutorials on completion. Do not add a practice-mode replica.

### P1 - Label search and filter controls

The inbox search, tag filter, bulk tag input, directory search, public-board request search, and request sort select rely on placeholders or nearby context. Placeholders disappear after entry and are not a durable accessible name.

Add visible labels where space permits and `aria-label` for compact toolbar controls. Keep the visible copy short and consistent.

## Important Improvements

### P2 - Reduce project-page navigation layers

Project setup currently combines the global sidebar's expanded project tree, a sticky project tab rail, and a four-step setup progress navigator. On mobile, the tab rail is horizontally clipped while the stepper occupies most of the first viewport.

Keep one persistent project navigation system. Show setup progress only until verification is complete, then collapse it into a small status/action row.

### P2 - Give mobile horizontal rails an affordance

Inbox status filters, project filters, and project tabs are horizontally scrollable but appear simply cut off. Users cannot tell more options exist.

Add a trailing fade/edge cue and keep the selected item scrolled into view. Consider a compact "More filters" sheet for secondary inbox filters instead of two independent rails.

### P2 - Compress the public-directory mobile hero

On mobile, the hero and three stacked metrics consume the entire first viewport; browsing controls do not appear until after a long scroll. The primary job is finding a board.

Reduce the hero height, place the metrics in one compact row, and reveal the search or first board card in the initial viewport.

### P2 - Make the dashboard adapt after activation

The permanent "What you can do" panel repeats Tutorial Center content and uses substantial space for established accounts. It pushes current signal and recent activity downward.

Show a focused next action while setup is incomplete. After activation, collapse this into a small help entry and prioritize inbox health, recent feedback, and delivery failures.

### P2 - Strengthen dark-mode hierarchy

Dark mode uses very similar olive-black values for the page, cards, inputs, and borders. Status colors work, but larger surfaces blend together and the interface feels flatter than light mode.

Separate the canvas from working surfaces with neutral charcoal values, slightly stronger borders, and clearer muted-text contrast. Keep green primarily for selection, success, and primary action.

### P2 - Clarify billing state

"Pro", "active", "Billing offline", and "Manage Billing" appear together. That combination does not tell the user whether billing is healthy, unavailable, or intentionally in test mode.

Use one plain-language state sentence and disable or replace actions that cannot succeed in the current state.

## Lower-Priority Polish

### P3 - Prepare project selectors for larger accounts

Integrations and API repeat every project as a full-width row without search. This is fine at six projects but will degrade quickly. Reuse a searchable project picker and default to the currently selected project when appropriate.

### P3 - Increase compact mobile targets

Several category, sort, navigation, and menu controls measure 30-38px tall. Increase primary mobile targets to at least 40px, preferably 44px, without making desktop rows looser.

### P3 - Use route-specific browser titles consistently

Integrations, API, boards, and public-board pages have useful titles, while several authenticated routes retain the generic product title. Give each primary route a distinct title for orientation and browser history.

## What Is Working

- No tested route produced horizontal viewport overflow at 390px or 1440px.
- The shell, active navigation state, typography, and primary actions are consistent.
- Project setup has a clear next action and understandable four-step order.
- Inbox rows preserve high information density without becoming a table wall.
- Light mode has strong hierarchy and readable status accents.
- The compact screenshot preview and modal viewer fit both tested viewports and close cleanly.
- Public-board owner actions are visible and the public request hierarchy is understandable.
- Loading states avoid layout collapse, and no tested route emitted console or page errors.

## Recommended Order

1. Paginate the directory and separate owner-board management from global discovery.
2. Build real guided topic tutorials on the existing tour engine.
3. Add control labels and improve mobile filter/tab discovery.
4. Simplify project navigation and make dashboard help adaptive.
5. Refine dark-mode surface hierarchy, billing state copy, and mobile target sizes.
