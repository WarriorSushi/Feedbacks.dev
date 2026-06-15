# Vibe Coder Agent Setup Plan

Date: 2026-06-15

## Purpose

Make feedbacks.dev easy for people who are building with AI agents, not just people who want to manually paste snippets. The product should let a user give their coding agent the right project key, endpoint, install snippet, and verification task so the agent can install feedback collection inside the user's app.

This plan defines what needs to be developed before the landing page can claim full agent-assisted setup.

## Product Promise

A user should be able to say:

> Add feedback collection to my app with feedbacks.dev.

Their agent should then be able to:

1. Create or select a feedbacks.dev project.
2. Retrieve a scoped setup packet.
3. Install the widget in the target codebase.
4. Send or guide a test feedback submission.
5. Confirm the item arrived in the dashboard with useful context.

## Target Users

- Vibe coders who are shipping with Claude Code, Cursor, Codex, Windsurf, or other agentic builders.
- Developers who prefer giving setup tasks to an agent.
- Agencies that want repeatable feedback installation across client apps.
- Small teams that need feedback quickly but do not want to read dense docs.

## Required Product Surface

### Dashboard

- Add an "AI setup" or "Agent setup" action on the project install page.
- Generate a scoped setup packet for a project.
- Show what the agent can and cannot do.
- Let the user copy a prompt for their AI builder.
- Let the user rotate or revoke any setup token.
- Keep the normal Website snippet as the recommended first-run path.

### API

- Add an endpoint that returns an agent-readable setup packet.
- Packet should include:
  - project id
  - public project key
  - submission endpoint
  - Website snippet
  - React snippet
  - Vue snippet
  - verification URL
  - allowed origins, if configured
  - current widget version
  - docs links
- Include a short natural-language installation instruction block for agents.
- Avoid exposing secret API keys in browser or prompt text.

### MCP Server

- Add tools for setup assistance:
  - `get_project_setup_packet`
  - `list_projects`
  - `create_project`
  - `verify_widget_install`
  - `submit_test_feedback`
- Keep mutating tools scoped and auditable.
- Return concise, agent-friendly errors.

### Verification Flow

- Provide a hosted verify URL per project.
- Let the agent or user trigger a test submission.
- Confirm:
  - widget script loaded
  - project key matches
  - endpoint accepts submission
  - feedback appears in inbox
  - page context is captured

### Security and Abuse Controls

- Setup packets must never include server-only secrets.
- Agent setup tokens should be scoped, short-lived, and revocable.
- Require authenticated user action before creating a setup packet.
- Log setup packet creation and verification attempts.
- Rate-limit project creation, verification, and test submissions.
- Include origin allowlist guidance for production installs.

## Suggested Setup Packet Shape

```json
{
  "project": {
    "id": "project_123",
    "name": "My SaaS App",
    "publicKey": "fb_proj_...",
    "allowedOrigins": ["https://app.example.com"]
  },
  "widget": {
    "version": "latest",
    "endpoint": "https://app.feedbacks.dev/api/feedback",
    "recommendedSnippet": "<script src=\"https://app.feedbacks.dev/widget/latest.js\" data-project=\"fb_proj_...\" defer></script>",
    "frameworkSnippets": {
      "react": "...",
      "vue": "..."
    }
  },
  "verification": {
    "url": "https://app.feedbacks.dev/projects/project_123/verify",
    "instructions": [
      "Install the recommended snippet in the app shell.",
      "Open a page where the widget should appear.",
      "Submit one test feedback item.",
      "Return to the verify URL and confirm success."
    ]
  }
}
```

## User-Facing Prompt Template

```text
Use this feedbacks.dev setup packet to add feedback collection to my app.

Goals:
1. Install the recommended Website snippet unless the app already has a better React or Vue integration point.
2. Keep the widget install minimal.
3. Do not expose private API keys.
4. Run the app locally and confirm the feedback button appears.
5. Send one test report and tell me whether it appeared in the feedbacks.dev inbox.

Setup packet:
[paste packet here]
```

## Build Phases

### Phase 1: Copyable Agent Prompt

- Add copyable prompt to project install page.
- Include existing canonical snippets from `@feedbacks/shared`.
- Make clear that the user is giving instructions to their own AI agent.
- No new auth scopes yet.

### Phase 2: Agent-Readable Setup Packet

- Add authenticated dashboard endpoint for setup packet generation.
- Add short-lived setup token if needed for verification.
- Add MCP tool to fetch packet for an existing project.
- Add tests that packet snippets match dashboard snippets.

### Phase 3: End-to-End Agent Verification

- Add MCP tools for test submission and verification.
- Add dashboard status that shows the latest verification attempt.
- Add audit log entries for setup packet use.
- Add landing CTA for "Give this to your AI agent" once the flow is reliable.

## Acceptance Criteria

- A non-technical user can understand what to copy into their AI builder.
- A developer can inspect exact snippets and endpoints before trusting the flow.
- The agent flow cannot leak secret credentials.
- Setup packet snippets match dashboard-generated snippets.
- Verification proves that feedback reaches the inbox with URL and browser context.
- The normal quick install flow remains simpler than the advanced agent path.

## Open Questions

- Should setup packets be plain JSON, Markdown, or both?
- Should agent setup be Free, Pro, or rate-limited by plan?
- Should the MCP server create projects, or only operate on existing projects at first?
- Should verification require an origin allowlist before production launch?
- How much state should be written back by the agent versus confirmed by the user?
