# Product Updates UX and Navigation Redesign Implementation Plan

**Date:** 2026-07-18  
**Status:** Approved implementation plan  
**Audience:** Junior developers and coding agents  
**Product register:** Application dashboard  
**Scope:** Dashboard information architecture, Product Updates onboarding, shared embed activation, update authoring, verification, and rollout

## 1. Purpose

Product Updates is implemented and live, but it is too difficult to discover and configure. It currently appears as a project tab, depends on a setting inside the feedback widget configuration, and exposes a large editor before a new user understands the setup path.

This redesign must make Product Updates feel like a first-class feedbacks.dev product that can be adopted independently. A customer who only wants to announce releases must not be forced to configure or display a feedback form.

The implementation must preserve the repository thesis:

- first-run setup must be extremely clear;
- installation must be trustworthy and easy to copy;
- time to first value must stay short;
- advanced configuration must not block basic setup;
- the product surface must remain small and maintainable.

## 2. Authority and relationship to the shipped MVP

The shipped MVP documents in this folder remain the source of truth for Product Updates content, publication, security, analytics, and end-user behavior.

This plan intentionally replaces only these MVP navigation and activation decisions:

1. Product Updates will no longer be hidden only inside the project horizontal menu.
2. `data-enable-updates="true"` will no longer be required for an already installed current-version embed to activate Updates.
3. A customer may install Updates without showing the feedback launcher or feedback form.
4. The dashboard will use server-resolved product modules and installation state.

The following MVP decisions remain non-negotiable:

- one shared customer-facing embed, not separate competing scripts;
- plain structured content, never arbitrary HTML or customer JavaScript;
- safe DOM rendering through `textContent`;
- aggregate privacy-preserving metrics only;
- local browser seen/dismissed state;
- feedback and update overlays never overlap;
- keyboard, focus, reduced-motion, mobile, and origin-restriction requirements;
- server-side Free and Pro enforcement;
- widget gzip hard limit of 20 KB, with a target of 16 KB or less.

## 3. Instructions for a junior developer

### 3.1 Read before editing

Read these files in order:

1. repository `AGENTS.md`;
2. repository `README.md`;
3. `docs/product-brief.md`;
4. `docs/prd.md`;
5. `docs/user-stories.md`;
6. `docs/mvp-scope.md`;
7. `docs/technical-direction.md`;
8. `docs/features/product-updates/README.md`;
9. `docs/features/product-updates/product-spec.md`;
10. `docs/features/product-updates/technical-design.md`;
11. this plan;
12. `docs/features/product-updates/test-and-rollout-plan.md`.

Do not begin a phase until you can explain its user outcome in one sentence.

### 3.2 Working rules

- Work on a `codex/` feature branch.
- Implement one phase at a time.
- Do not mix navigation, schema, runtime, and editor rewrites in one commit.
- Preserve existing behavior until its replacement is verified.
- Keep old query-string routes working through redirects during migration.
- Never expose a service-role key to a browser.
- Never use authentication `user_metadata` for authorization.
- Any new table in `public` must have RLS, explicit grants, and ownership policies.
- Prefer `SECURITY INVOKER` for database functions. Revoke default function execution before granting a service-only role.
- Do not apply a migration to production until it passes in a non-production project and the schema check is updated.
- Do not call a skipped E2E suite a pass. Use `pnpm test:e2e:required` when verifying a release environment.
- If a requirement is ambiguous, follow this plan instead of inventing a new product model.

### 3.3 Required checks after every phase

Run the smallest relevant checks during development. Before a phase is complete, run:

```bash
pnpm type-check
pnpm lint
pnpm test:unit
```

If widget or shared embed code changed, also run:

```bash
pnpm widget:build
pnpm widget:check-size
pnpm widget:copy
```

Before opening or updating the final pull request, run:

```bash
pnpm build
pnpm supabase:check
pnpm test:e2e:required
git diff --check
```

## 4. Product outcome

A new user must be able to:

1. find Updates from the main sidebar within five seconds;
2. choose Updates only without configuring Feedback;
3. install the shared embed with an AI assistant or copied code;
4. see an automatic connection confirmation;
5. create, privately test, and publish a first update in under five minutes;
6. enable Updates remotely when a current feedbacks.dev embed is already installed;
7. return later to a clear update list with status and performance.

An existing Feedback customer must be able to open Updates and activate it without replacing the installed snippet, provided the installed embed loads the current hosted runtime.

## 5. Current problems to remove

### 5.1 Navigation

- The sidebar highlights Projects while the horizontal project menu highlights Updates.
- Integrations, Public Board, and API are duplicated across both navigation systems.
- Updates is visible only after opening a project.
- Project name, project switcher, Projects backlink, and project menu repeat the same context.
- API key rotation and CSV export appear on unrelated project screens.

### 5.2 First-run experience

- The page begins with “Runtime is off,” which is internal language.
- The warning asks users to visit Customize even though the visible navigation says Setup.
- A full editor appears before installation or activation is explained.
- “New update” and “Create draft” appear at the same time.
- Advanced fields appear before title and summary.
- Milliseconds and include/exclude path arrays are exposed as default concepts.

### 5.3 Product architecture

- Product Updates is conceptually coupled to Feedback even though many customers may want only announcements.
- The installed script attribute is the activation source of truth.
- The dashboard cannot reliably tell whether the embed is installed.
- Existing customers may need a code deployment just to enable a dashboard feature.

## 6. Reference patterns and lessons

Use these products as evidence for interaction patterns, not as visual templates. feedbacks.dev must keep its own restrained developer-tool identity.

### Headway

[Headway](https://headwayapp.co/) treats a public changelog and an in-product widget as first-class surfaces. The useful lesson is that release communication is discoverable as its own job, not hidden under feedback configuration.

Apply:

- make Updates visible in primary navigation;
- show the in-product experience before asking for configuration;
- keep publishing simple and frequent.

Do not copy:

- marketing-heavy presentation inside the application dashboard;
- categories or features outside the approved MVP boundary.

### Canny

[Canny Product Changelog](https://canny.io/features/product-changelog) presents the embedded widget and the full update history as two parts of one product. It also connects shipped updates to the feedback loop without requiring users to begin from feedback management.

Apply:

- treat Updates as a product with its own overview;
- leave room for a future full history surface;
- connect Feedback and Updates later without coupling their setup paths.

### Beamer

[Beamer’s module configuration](https://www.getbeamer.com/help/how-do-i-use-beamer-feedback) allows changelog and feedback experiences to be shown or hidden independently.

Apply:

- one shared embed with independent product modules;
- Updates-only, Feedback-only, and combined modes;
- server-controlled activation after installation.

### PostHog

[PostHog’s installation experience](https://posthog.com/services) puts AI-assisted installation ahead of manual framework work. Its [onboarding wizard analysis](https://newsletter.posthog.com/p/we-used-ai-to-5x-conversion-and-2x) argues that framework-aware context and automated code changes reduce setup failure.

Apply:

- recommend an AI coding assistant for vibe coders;
- generate complete project-specific prompts;
- verify installation automatically;
- give recovery prompts with enough codebase context.

### Intercom

[Intercom’s Product Tour testing guidance](https://www.intercom.com/help/en/articles/2901112-test-your-product-tour) recommends testing as a new user, with different permissions, and with both empty and populated content.

Apply:

- test every state in the Updates state machine;
- provide a private test before publication;
- verify fresh-user, existing-user, empty, populated, Free, and Pro paths.

## 7. Approved information architecture

The selected project in the project switcher defines the scope of the sidebar.

```text
Project switcher
│
├── Overview
├── Products
│   ├── Feedback inbox
│   ├── Updates
│   └── Public board
│
├── Configure
│   ├── Install & verify
│   ├── Integrations
│   └── API & MCP
│
└── Account & help
    ├── Billing
    ├── Settings
    └── Docs
```

### 7.1 Navigation decisions

- Add Updates to the main sidebar with a `Megaphone` icon.
- Updates is always discoverable, even before activation.
- Show a temporary `New` badge until the user visits Updates once. Do not show a permanent promotional badge.
- Remove the sticky horizontal `ProjectMenu` after all replacement routes exist.
- Move “Manage projects” and “New project” into the project switcher.
- Rename Dashboard to Overview only if all related copy and tests are updated together. Do not leave both labels in the app.
- Rename Feedback to Feedback inbox or Inbox consistently. Prefer Feedback inbox during this redesign because it preserves product meaning.
- Move Export CSV to Feedback inbox.
- Move project key visibility and rotation to API & MCP and Install & verify only.
- Move project deletion, domain, icon, and name to project settings.

### 7.2 Route map

Use stable route segments for primary surfaces.

| Surface | New route |
|---|---|
| Updates overview | `/projects/[id]/updates` |
| New update | `/projects/[id]/updates/new` |
| Edit or inspect update | `/projects/[id]/updates/[updateId]` |
| Updates setup | `/projects/[id]/updates/setup` |
| Updates settings | `/projects/[id]/updates/settings` |
| Install and verify | `/projects/[id]/install` |
| Integrations | `/projects/[id]/integrations` |
| Public board settings | `/projects/[id]/board` |
| API and MCP | `/projects/[id]/api` |
| Project settings | `/projects/[id]/settings` |

Keep the existing `?tab=` URLs temporarily. Redirect each old URL to its new equivalent. Add unit tests for every redirect and project-switch destination.

## 8. Product module model

The customer installs one **feedbacks.dev embed**. The embed can run these independent modules:

- Feedback;
- Updates.

Public Board remains a hosted surface and does not need an embed module.

### 8.1 Module behavior

| Feedback | Updates | Runtime result |
|---|---|---|
| On | Off | Current feedback experience only |
| Off | On | Updates can auto-show or open manually; no feedback launcher |
| On | On | Both products are available; overlays remain mutually exclusive |
| Off | Off | Embed remains dormant except for cached bootstrap and install verification |

Existing projects default to Feedback on to preserve current behavior. New users select Updates only, Feedback only, or Both during setup.

## 9. Updates state machine

The dashboard must render one state, not a mixture of setup and editing controls.

### State A: no project

Show a short project creation step with one required field: app or project name. After creation, route directly to Updates setup if the user entered from Updates.

Primary action: `Create app`

### State B: embed not detected

Show the Updates value proposition, a real preview, product choice, and installation method.

Primary action: `Set up Updates`

Secondary action: `Preview the experience`

### State C: current embed detected, Updates inactive

Show connection status and explain that no code change is required.

Primary action: `Activate Updates`

### State D: Updates active, no updates created

Show a concise empty state and sample preview.

Primary action: `Create your first update`

### State E: Updates active with content

Show the list-first workspace with status, publication time, views, CTA clicks, and dismissals.

Primary action: `New update`

## 10. Screen specifications

### 10.1 Updates first-run page

Approved copy direction:

**Share what shipped, inside your product**

“Publish release notes that appear once to each visitor. Install the embed once, then publish future updates from here.”

Do not show an amber warning as the first experience. Use a neutral connection state with one recovery action.

### 10.2 Setup flow

The setup flow contains three visible steps:

1. Choose products.
2. Install the embed.
3. Verify connection.

Product choices:

- Updates only;
- Feedback only;
- Feedback + Updates.

Installation method order:

1. AI coding assistant, recommended;
2. script tag;
3. React;
4. Vue.

The AI assistant option must produce a complete prompt containing:

- the correct package or script URL;
- the browser-safe project key;
- the selected products;
- the expected placement;
- a request to preserve the host app’s design and existing dependencies;
- a final verification instruction.

Never include a service-role or private server key.

### 10.3 Updates overview

Use a list-first layout. Do not render the editor on this route.

Header:

- title: Updates;
- short connection state;
- primary action: New update.

List row:

- title and optional version;
- Draft, Scheduled, Live, Expired, or Archived;
- publication date;
- views;
- CTA clicks;
- overflow menu for archive, restore, duplicate later, and delete.

Do not show API keys or CSV actions here.

### 10.4 Composer

Use a dedicated route. Order fields by user intent.

Default fields:

1. Title;
2. Summary;
3. Image;
4. Highlights.

Progressively disclosed fields:

- version label;
- CTA label and URL;
- expiration;
- page targeting.

Delivery controls must use plain language:

- `Show on`: Everywhere or Specific pages;
- `Show after`: Immediately, 3 seconds, or 5 seconds;
- `Appearance`: Match visitor device, Light, or Dark;
- `Frequency`: Each visitor sees this once.

Use seconds in the UI. Convert to milliseconds only at the API boundary.

Preview controls:

- Desktop;
- Mobile;
- Light;
- Dark;
- Open private test.

Footer actions:

- Save draft;
- Test;
- Publish now or Schedule.

Only one action is visually primary at a time.

### 10.5 Updates settings

Keep only product-level settings:

- Updates enabled;
- default theme;
- accent color;
- default delay;
- default page targeting;
- feedbacks.dev branding entitlement.

Advanced path rules must be collapsed by default and include examples.

### 10.6 Post-publish confirmation

After publication show:

- Published successfully;
- when it becomes eligible;
- where it will appear;
- Open private test;
- Return to Updates.

Do not immediately drop the user back into an editable blank form.

## 11. Shared embed bootstrap design

### 11.1 Public bootstrap endpoint

Add:

```text
GET /api/widget/bootstrap?projectKey=...
OPTIONS /api/widget/bootstrap
```

Responsibilities:

- hash and resolve the browser-safe project key;
- apply origin restriction and CORS rules;
- apply rate limits;
- return only public, bounded configuration;
- return server-controlled Feedback and Updates module flags;
- include live Product Updates payload only when Updates is enabled;
- return an ETag and bounded cache headers;
- update an aggregate installation heartbeat only when the stored value is stale.

Example response:

```json
{
  "configVersion": 2,
  "modules": {
    "feedback": true,
    "updates": true
  },
  "updates": {
    "settings": {},
    "items": []
  }
}
```

The final field names must reuse shared TypeScript contracts. Do not maintain separate dashboard and widget shapes.

### 11.2 Backward compatibility

- Existing script attributes continue to configure Feedback presentation.
- `data-enable-updates` remains accepted but is no longer the only activation source.
- Server module flags become authoritative after bootstrap succeeds.
- If bootstrap fails, preserve current Feedback behavior and fail Updates silently.
- Do not make a Feedback installation stop working because the new endpoint is unavailable.
- Keep `/api/widget/updates` during migration. It may delegate to shared service code. Remove it only in a later documented deprecation.

### 11.3 Runtime behavior

- Fetch bootstrap once per page load.
- Never render a feedback launcher when Feedback is disabled.
- Never request or render update content when the returned Updates module is disabled.
- Keep Feedback and Updates overlays mutually exclusive.
- Preserve manual trigger support.
- Preserve local seen and dismissed state.
- Recheck path eligibility immediately before auto-show.
- Respect visibility state and reduced motion.

## 12. Installation detection and database plan

Create a migration through the repository’s Supabase workflow. Do not invent a migration filename manually if the repository has adopted timestamped Supabase migrations; use `supabase migration new` after checking CLI help. If this repository continues to use numbered SQL handoffs, follow the established repository convention and document the exception.

Proposed table:

```text
project_embed_installations
```

Minimum columns:

| Column | Purpose |
|---|---|
| `project_id` | Primary key and cascading project foreign key |
| `last_seen_at` | Last throttled bootstrap observation |
| `runtime_version` | Bounded non-sensitive runtime version |
| `feedback_enabled` | Last server module state observed |
| `updates_enabled` | Last server module state observed |
| `created_at` | Audit timestamp |
| `updated_at` | Audit timestamp |

Privacy rules:

- do not store IP addresses;
- do not store page URLs;
- do not store user agents;
- do not store customer-user identifiers;
- do not create one row per visitor or page view;
- write at most once per project per throttling window.

Security rules:

- enable RLS;
- authenticated owners may select only their own project row;
- only the service role may insert or update heartbeat state;
- revoke access from `public` and `anon`;
- add explicit grants rather than relying on defaults;
- add the table and columns to `scripts/check-supabase-schema.mjs`;
- regenerate database types after migration verification.

Store the Feedback module preference in the existing validated project widget configuration with a backward-compatible default of `true`. Continue using `product_update_settings.enabled` as the Updates module activation flag unless implementation discovers a proven transactional conflict.

## 13. Owner API plan

Add owner-only routes:

```text
GET   /api/projects/[id]/modules
PATCH /api/projects/[id]/modules
GET   /api/projects/[id]/embed-status
```

Requirements:

- use the existing authenticated user and project ownership helper;
- accept only known boolean fields;
- preserve omitted settings during PATCH;
- enforce entitlements on the server;
- return `Cache-Control: no-store`;
- never return service keys;
- include a deterministic state: `not_detected`, `connected`, or `stale`;
- include `lastSeenAt` only for the project owner.

## 14. Implementation phases

### Phase 0: baseline and safety net

Tasks:

- capture screenshots of desktop, tablet, and mobile navigation;
- record current widget gzip size;
- add tests for existing project switching and old `?tab=` URLs;
- write a route mapping test fixture;
- add activation event names to a shared contract before emitting them.

Acceptance criteria:

- current production behavior is documented;
- existing tests pass before structural changes;
- no database or runtime behavior changes yet.

### Phase 1: navigation foundation

Likely files:

- `packages/dashboard/src/components/sidebar.tsx`;
- `packages/dashboard/src/lib/project-navigation.ts`;
- `packages/dashboard/src/app/(dashboard)/projects/[id]/project-flow-nav.tsx`;
- `packages/dashboard/src/app/(dashboard)/projects/[id]/project-tabs.tsx`;
- route pages under `packages/dashboard/src/app/(dashboard)/projects/[id]/`;
- project switching and middleware unit tests.

Tasks:

- group sidebar navigation into Products and Configure;
- add top-level Updates;
- add Manage projects and New project to the switcher;
- create stable route pages;
- add redirects from old tab URLs;
- move CSV and key controls to their proper surfaces;
- remove the horizontal menu only after route parity exists.

Acceptance criteria:

- exactly one navigation item is active;
- Updates is reachable in one click after project selection;
- changing project preserves the current product surface;
- mobile drawer exposes the same hierarchy;
- keyboard focus and aria-current are correct.

### Phase 2: module settings and bootstrap contract

Likely files:

- `packages/shared/src/widget-install.ts`;
- new shared bootstrap contract;
- new public bootstrap route;
- project module owner routes;
- product update public service helpers;
- schema check and database types;
- a new verified SQL migration.

Tasks:

- add Feedback module enablement with a `true` compatibility default;
- implement bootstrap response contracts;
- implement origin, rate-limit, cache, and response-size protections;
- add installation heartbeat storage and owner status;
- add unit tests for public data boundaries and module combinations.

Acceptance criteria:

- all four module combinations return the correct public contract;
- an anonymous request cannot read owner installation status;
- no viewer-level data is stored;
- schema and RLS checks pass in non-production.

### Phase 3: widget runtime migration

Likely files:

- `packages/widget/src/widget.ts`;
- `packages/widget/src/index.ts`;
- `packages/widget/src/product-updates.ts`;
- React and Vue wrappers;
- generated dashboard widget assets;
- widget contract and size tests.

Tasks:

- fetch bootstrap safely;
- preserve Feedback on bootstrap failure;
- support Updates-only mode;
- activate Updates from server settings without a new script attribute;
- keep legacy attributes as supported overrides;
- update wrappers and snippets;
- rebuild and copy hosted widget artifacts.

Acceptance criteria:

- a legacy Feedback snippet continues working;
- an existing current runtime can activate Updates remotely;
- Updates-only creates no feedback launcher;
- disabled Updates does not fetch the separate updates content endpoint;
- widget remains below 20 KB gzip;
- overlays, focus, local state, routes, and metrics remain correct.

### Phase 4: state-driven Updates onboarding

Likely files:

- new Updates route components;
- module and embed-status hooks;
- install prompt generator;
- installation verification UI;
- dashboard E2E fixtures.

Tasks:

- implement States A through E;
- add Updates only, Feedback only, and Both selection;
- add AI assistant install prompt;
- add script, React, and Vue instructions;
- poll owner embed status with a bounded interval and clean cancellation;
- provide actionable recovery messages;
- route successful verification directly to first update creation.

Acceptance criteria:

- a new user never sees “Runtime is off”;
- an existing connected customer sees one-click activation;
- setup progress survives refresh;
- no secret key appears in generated prompts;
- failure states explain the next action without requiring documentation.

### Phase 5: Updates overview and composer

Tasks:

- replace the all-in-one Updates tab with list-first overview;
- move authoring to dedicated routes;
- reorder fields;
- collapse advanced fields;
- convert delay UI to seconds;
- add private test action;
- add clear post-publish confirmation;
- keep archive, restore, schedule, image, metrics, and entitlement behavior.

Acceptance criteria:

- overview never displays an unsaved blank editor;
- title and summary are the first fields;
- one primary action is visible at each stage;
- publishing requires a deliberate review action;
- desktop and mobile previews match widget output;
- Free and Pro restrictions remain server enforced.

### Phase 6: app-wide clarity pass

Tasks:

- normalize Overview, Feedback inbox, Updates, Public board, Install & verify, Integrations, and API & MCP labels;
- remove duplicated breadcrumbs and project context;
- simplify empty states around the next useful action;
- add a signup or first-project goal choice: Announce updates, Collect feedback, or Both;
- ensure product tours do not cover required controls;
- verify responsive navigation and long project names.

Acceptance criteria:

- navigation labels are consistent across sidebar, pages, docs, and tests;
- no page has unrelated project utilities in its header;
- first-run flows are goal-specific;
- users can skip advanced configuration.

### Phase 7: analytics, dogfood, and rollout

Track aggregate owner activation events:

- `updates_nav_opened`;
- `updates_setup_started`;
- `updates_install_method_selected`;
- `updates_embed_verified`;
- `updates_activated`;
- `updates_first_draft_created`;
- `updates_private_test_opened`;
- `updates_first_published`;
- `updates_first_impression_received`.

Do not attach viewer identity or raw visitor URLs to these events.

Rollout order:

1. local and unit verification;
2. non-production Supabase migration;
3. preview deployment;
4. E2E for new, existing, Updates-only, Feedback-only, and Both states;
5. internal feedbacks.dev dogfood;
6. production migration;
7. production deployment behind a server flag if available;
8. monitor errors and activation funnel;
9. remove old horizontal menu and deprecated routes only after stability.

## 15. UX and visual rules

- Use a restrained color strategy. Lime is for primary action, active state, and success, not large navigation surfaces.
- Do not use gradients, glass effects, nested cards, or decorative metric heroes.
- Do not add a colored side stripe to alerts or rows.
- Use one page title and one primary action.
- Keep body copy within 65 to 75 characters per line where practical.
- Use meaningful spacing rhythm rather than equal padding everywhere.
- Use cards only for real boundaries such as preview, connection state, or a list container.
- Prefer inline setup and dedicated pages over modals.
- Respect light and dark themes without pure black or pure white surfaces.
- Use fast ease-out motion only for navigation and state confirmation.
- Preserve 44px touch targets on mobile.

## 16. Copy glossary

| Avoid | Use |
|---|---|
| Runtime is off | Updates are not connected yet |
| Enable these settings | Set up Updates |
| Widget, when discussing installation | feedbacks.dev embed |
| Display delay milliseconds | Show after |
| Include paths | Show on specific pages |
| Exclude paths | Hide on specific pages |
| Product Updates in navigation | Updates |
| What’s New in owner navigation | Updates |
| Updates in the customer modal eyebrow | What’s New |
| Project API key on non-developer pages | Project key inside Install or API & MCP |

## 17. Test matrix

### 17.1 User states

- no projects;
- project with no detected embed;
- legacy Feedback installation;
- current Feedback-only installation;
- Updates-only installation;
- Feedback and Updates installation;
- Updates active with no drafts;
- draft, scheduled, live, expired, and archived content;
- Free and Pro accounts;
- hidden project key;
- origin restriction enabled;
- light, dark, mobile, and reduced-motion environments.

### 17.2 Critical E2E stories

1. A new user chooses Updates only, installs, verifies, creates, tests, and publishes.
2. An existing Feedback user activates Updates without changing the snippet.
3. Updates-only never shows a feedback launcher.
4. A bootstrap failure does not break an existing Feedback installation.
5. Switching projects while on Updates remains on Updates for the new project.
6. Old `?tab=updates` URLs redirect correctly.
7. A Free account cannot exceed active-update limits or remove branding.
8. A Pro account can schedule and remove branding.
9. A published update appears once automatically and can be reopened manually.
10. Feedback and Updates cannot be open simultaneously.

## 18. Success metrics

Initial targets:

- 90% of usability-test participants find Updates within five seconds;
- median time from Updates setup start to verified embed is under three minutes;
- median time to first published update is under five minutes;
- at least 60% of users who start Updates setup reach first publish;
- fewer than 10% revisit installation because activation instructions were unclear;
- no statistically meaningful regression in Feedback widget submissions;
- no widget gzip regression above the 20 KB hard limit.

Run at least five moderated tests with people who build using AI coding tools and have not used feedbacks.dev before. Give them the task “announce a feature inside your app” and do not tell them where Updates is located.

## 19. Definition of done

This redesign is complete only when:

- Updates is a first-class sidebar product;
- the duplicate horizontal project menu is gone;
- stable project routes replace query tabs with redirects preserved;
- Updates-only installation works;
- existing current-version Feedback installations can activate Updates remotely;
- installation status is accurate and privacy-preserving;
- the setup page is state-driven;
- the overview is list-first;
- the composer uses progressive disclosure and plain language;
- all public and owner API security checks pass;
- Supabase RLS, grants, schema checks, and types are verified;
- widget size, unit, build, required E2E, mobile, accessibility, and dogfood checks pass;
- production can be rolled back without breaking Feedback collection;
- documentation reflects the final navigation and installation model.

## 20. Copy-paste prompt for a Terra-class development model

Use the prompt below for a smaller or less capable coding model. Give it only one phase at a time. Do not ask it to implement the entire plan in one run.

```text
You are implementing one bounded phase of the feedbacks.dev Product Updates UX redesign.

Repository: C:\coding\feedbacks.dev
Implementation plan:
docs/features/product-updates/ux-navigation-redesign-implementation-plan-2026-07-18.md

Your assigned phase is: [REPLACE WITH EXACT PHASE NUMBER AND NAME]

Before editing:
1. Read AGENTS.md.
2. Read the repository product documents in the exact order required by AGENTS.md.
3. Read docs/features/product-updates/README.md, product-spec.md, technical-design.md, the dated UX redesign plan, and test-and-rollout-plan.md.
4. Inspect the existing implementation. Do not assume filenames or contracts.
5. Restate the assigned phase outcome, files likely affected, compatibility risks, and tests you will run.

Implementation rules:
- Implement only the assigned phase. Do not start later phases.
- Preserve current production behavior until the replacement is verified.
- Keep old routes and widget attributes backward compatible where the plan requires it.
- Do not expose service-role keys or private server credentials.
- Do not use auth user_metadata for authorization.
- Every public-schema table needs RLS, explicit grants, and ownership policies.
- Prefer SECURITY INVOKER and revoke default function execution.
- Product Updates and Feedback overlays must never overlap.
- Customer content must be rendered with textContent, never unsafe innerHTML.
- Keep aggregate analytics privacy-preserving.
- Keep the widget below 20 KB gzip.
- Use apply_patch for manual file edits.
- Preserve unrelated user changes in the worktree.
- Do not deploy or mutate production unless the user explicitly authorizes that exact production action.

UX rules:
- One active navigation system.
- One primary action per page state.
- No gradients, glass effects, nested cards, colored side stripes, or decorative hero metrics.
- Use progressive disclosure for advanced settings.
- Use plain language from the plan’s copy glossary.
- Preserve keyboard access, focus states, reduced motion, mobile layout, and 44px touch targets.

Verification:
1. Add or update targeted tests for the phase.
2. Run pnpm type-check.
3. Run pnpm lint.
4. Run pnpm test:unit.
5. If widget code changed, run pnpm widget:build, pnpm widget:check-size, and pnpm widget:copy.
6. Run pnpm build before declaring the phase complete.
7. Report any E2E or Supabase check that could not run. Never call a skipped test a pass.
8. Run git diff --check and summarize the final diff.

At the end, report:
- what changed;
- which acceptance criteria from the assigned phase are satisfied;
- exact test results;
- compatibility or rollout risks;
- the next phase, without implementing it.
```

### Recommended Terra task sequence

Run separate tasks in this order:

1. `Phase 0: baseline and safety net`
2. `Phase 1: navigation foundation`
3. `Phase 2: module settings and bootstrap contract`
4. `Phase 3: widget runtime migration`
5. `Phase 4: state-driven Updates onboarding`
6. `Phase 5: Updates overview and composer`
7. `Phase 6: app-wide clarity pass`
8. `Phase 7: analytics, dogfood, and rollout`

Review and test each phase before giving the next prompt. Smaller models are more reliable when the acceptance boundary is explicit and later phases are prohibited.
